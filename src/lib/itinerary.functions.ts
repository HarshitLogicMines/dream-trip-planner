import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TierEnum = z.enum(["budget", "mid", "premium", "custom"]);

const InputSchema = z.object({
  destination: z.string().trim().min(1).max(120),
  days: z.number().int().min(1).max(30),
  travelers: z.number().int().min(1).max(50),
  tier: TierEnum,
  prompt: z.string().trim().max(1000).optional(),
});

export type ItineraryInput = z.infer<typeof InputSchema>;

export type ItineraryActivity = {
  time: string;
  title: string;
  category: string;
  description: string;
  imageSearchQuery: string; // REQUIRED: 2-4 word search query
};

export type ItineraryDay = {
  day: number;
  title: string;
  summary: string;
  activities: ItineraryActivity[];
};

export type Itinerary = {
  destination: string;
  tier: z.infer<typeof TierEnum>;
  travelers: number;
  days: ItineraryDay[];
  tips: string[];
};

const TIER_BRIEF: Record<z.infer<typeof TierEnum>, string> = {
  budget:
    "Budget-Friendly ($): hostels/guesthouses, street food, public transit, free heritage sites and walking tours.",
  mid: "Mid-Range ($$): boutique hotels, local bistros, curated guided experiences, workshops, and comfortable transit.",
  premium:
    "Premium ($$$): luxury stays, private guides, chauffeur transfers, Michelin-tier or renowned restaurants, VIP access.",
  custom:
    "Custom: balance quirky/off-beat experiences with the user's own prompt. Prioritize personalization.",
};

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export const generateItinerary = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => InputSchema.parse(raw))
  .handler(async ({ data }): Promise<Itinerary> => {
    const key = process.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error("Missing VITE_GEMINI_API_KEY");

    const system = `You are a meticulous travel journal author. You write day-by-day itineraries that feel like hand-annotated journals — specific place names, atmospheric detail, and a mix of tourist attractions, local events, cultural/heritage sites, and fun activities. Every day is unique.

CRITICAL REQUIREMENTS:
1. For the "title" field: Use ONLY real, specific place names (e.g., "Fushimi Inari Shrine" not "ancient shrine")
2. For the "imageSearchQuery" field: MANDATORY for EVERY activity, NO EXCEPTIONS
   - Must be 2-4 words exactly
   - Must describe the place/experience/food uniquely
   - Must be searchable on Unsplash
   - Examples: "fushimi inari shrine", "kyoto bamboo forest", "japanese ramen bowl"
3. Every activity MUST have all fields including imageSearchQuery

Output STRICT JSON only, no prose, no markdown fences.`;

    const userPrompt = `Plan a trip to "${data.destination}" for ${data.days} day(s) for ${data.travelers} traveler(s).
Fare class: ${TIER_BRIEF[data.tier]}
${data.prompt ? `Additional user notes: ${data.prompt}` : ""}

IMPORTANT: YOU MUST include imageSearchQuery for EVERY SINGLE activity. It is MANDATORY, not optional.

Return JSON matching EXACTLY this TypeScript type:
{
  "destination": string,
  "tier": "budget" | "mid" | "premium" | "custom",
  "travelers": number,
  "days": Array<{
    "day": number,
    "title": string,          // evocative title for the day (e.g. "Morning Mist at Arashiyama")
    "summary": string,        // 1-2 sentences framing the day
    "activities": Array<{
      "time": string,         // e.g. "07:30" or "Morning"
      "title": string,        // specific place or experience name
      "category": "Tourist Attraction" | "Local Event" | "Cultural Heritage" | "Fun Activity" | "Dining" | "Rest",
      "description": string,  // 1-3 sentences, journal voice, atmospheric
      "imageSearchQuery": string  // MANDATORY FOR EVERY ACTIVITY! 2-4 word search query for Unsplash photos
    }>
  }>,
  "tips": string[]            // 3-5 practical local tips tailored to the tier
}

MANDATORY "imageSearchQuery" Requirements for EVERY activity:
- 2-4 words exactly (not more, not less)
- Must describe the actual place/attraction/experience/food
- Must be searchable on Unsplash (common terms, not made-up names)
- Should include location context when helpful
- Best examples:
  ✅ "fushimi inari shrine"
  ✅ "arashiyama bamboo grove"
  ✅ "japanese ramen noodles"
  ✅ "kyoto temple garden"
  ✅ "philosopher's path walk"
  ❌ "amazing place" (too vague)
  ❌ "beautiful scene" (not searchable)
  ❌ "morning visit" (not descriptive)

RULE: If ANY activity is missing imageSearchQuery, the entire response is INVALID and will be rejected.

Include 4-6 activities per day, mixing categories. Do not repeat places across days.`;

    const res = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("AI is busy — please retry in a moment.");
      if (res.status === 401 || res.status === 403)
        throw new Error("Gemini API key is invalid or unauthorized.");
      throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const payload = (await res.json()) as GeminiGenerateContentResponse;
    const content =
      payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim() ?? "";
    if (!content) throw new Error("AI returned an empty itinerary.");
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned malformed itinerary.");
      parsed = JSON.parse(match[0]);
    }

    const p = parsed as Partial<Itinerary>;
    
    // Ensure all activities have imageSearchQuery — fallback to title if missing
    const normalizedDays = Array.isArray(p.days)
      ? p.days.map((day) => ({
          ...day,
          activities: Array.isArray(day.activities)
            ? day.activities.map((activity) => ({
                ...activity,
                imageSearchQuery:
                  activity.imageSearchQuery ||
                  activity.title ||
                  "travel photography",
              }))
            : [],
        }))
      : [];
    
    return {
      destination: p.destination ?? data.destination,
      tier: (p.tier as Itinerary["tier"]) ?? data.tier,
      travelers: p.travelers ?? data.travelers,
      days: normalizedDays,
      tips: Array.isArray(p.tips) ? p.tips : [],
    };
  });

// Server function to fetch REAL place image from Wikipedia/Wikimedia.
// No API key required — returns the actual photo of the actual place (not stock).
// The AI (Gemini) provides the exact place name; we look up its real photo.
export const fetchUnsplashImage = createServerFn({ method: "POST" })
  .inputValidator(
    (raw: unknown) =>
      z
        .object({
          query: z.string().min(1).max(200),
          destination: z.string().max(120).optional(),
        })
        .parse(raw)
  )
  .handler(async ({ query, destination }): Promise<string | null> => {
    // Build a fallback chain of search terms, most specific first.
    const candidates = [
      query,
      destination ? `${query} ${destination}` : null,
      destination ?? null,
    ].filter((t): t is string => Boolean(t && t.trim()));

    // 1) Try Wikipedia REST Summary API — returns the curated lead photo
    //    for the exact article. This is a REAL image of the actual place.
    for (const term of candidates) {
      const url = await fetchWikipediaThumbnail(term);
      if (url) return url;
    }

    // 2) Fallback: Wikipedia OpenSearch → find the best-matching article,
    //    then fetch its lead image via the MediaWiki API.
    for (const term of candidates) {
      const url = await fetchWikipediaViaSearch(term);
      if (url) return url;
    }

    return null; // Nothing found — UI shows graceful MapPin placeholder
  });

// ── Wikipedia helpers ─────────────────────────────────────────────────────────

type WikiSummary = {
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
};

/**
 * Direct lookup via the Wikipedia REST Summary endpoint.
 * Upscales the thumbnail to 640px for a crisp card image.
 */
async function fetchWikipediaThumbnail(term: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term.trim())}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as WikiSummary;
    const src = data.originalimage?.source ?? data.thumbnail?.source;
    if (!src) return null;

    // Upscale the Wikimedia CDN thumbnail (e.g. /320px- → /640px-)
    return src.replace(/\/\d+px-/, "/640px-");
  } catch {
    return null;
  }
}

/**
 * Fallback: use OpenSearch to resolve a fuzzy term to a real article title,
 * then query the MediaWiki API for that page's lead image (pageimages).
 */
async function fetchWikipediaViaSearch(term: string): Promise<string | null> {
  try {
    // Step 1: OpenSearch → best matching article title
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&origin=*&search=${encodeURIComponent(
        term.trim()
      )}`,
      { headers: { Accept: "application/json" } }
    );
    if (!searchRes.ok) return null;

    // OpenSearch response: [query, [titles], [descriptions], [urls]]
    const searchData = (await searchRes.json()) as [string, string[], string[], string[]];
    const title = searchData?.[1]?.[0];
    if (!title) return null;

    // Step 2: pageimages → lead thumbnail for the resolved title
    const imgRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=640&titles=${encodeURIComponent(
        title
      )}`,
      { headers: { Accept: "application/json" } }
    );
    if (!imgRes.ok) return null;

    type PageImagesResponse = {
      query?: {
        pages?: Record<string, { thumbnail?: { source?: string } }>;
      };
    };

    const imgData = (await imgRes.json()) as PageImagesResponse;
    const pages = imgData.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      if (page.thumbnail?.source) return page.thumbnail.source;
    }
    return null;
  } catch {
    return null;
  }
}
