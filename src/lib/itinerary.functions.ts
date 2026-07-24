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

// Server function to fetch place image from Unsplash (FREE, no auth required)
export const fetchUnsplashImage = createServerFn({ method: "POST" })
  .inputValidator(
    (raw: unknown) =>
      z.object({ query: z.string().min(1).max(200) }).parse(raw)
  )
  .handler(async ({ query }): Promise<string | null> => {
    try {
      // Unsplash API doesn't require authentication for basic requests
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&order_by=relevant`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) return null;

      type UnsplashResponse = {
        results?: Array<{
          urls?: {
            regular?: string;
          };
        }>;
      };

      const data = (await res.json()) as UnsplashResponse;
      const imageUrl = data.results?.[0]?.urls?.regular;
      return imageUrl || null;
    } catch {
      return null; // Silently fail if network error
    }
  });
