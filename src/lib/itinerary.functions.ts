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
  placeId?: string;
  imageUrl?: string;
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

CRITICAL: For the "title" field in each activity, use ONLY real, specific place names or attractions that can be found in Google Maps/Places API:
- Use official, well-known place names (e.g., "Fushimi Inari Shrine" not "ancient shrine")
- Include both famous and local hidden gems
- Be precise with locations (e.g., "Arashiyama Bamboo Grove" not just "bamboo forest")
- Use the destination context to make activities geographically accurate

Output STRICT JSON only, no prose, no markdown fences.`;

    const userPrompt = `Plan a trip to "${data.destination}" for ${data.days} day(s) for ${data.travelers} traveler(s).
Fare class: ${TIER_BRIEF[data.tier]}
${data.prompt ? `Additional user notes: ${data.prompt}` : ""}

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
      "title": string,        // MUST BE REAL place name searchable in Google Maps (e.g., "Fushimi Inari Shrine", "Philosopher's Path")
      "category": "Tourist Attraction" | "Local Event" | "Cultural Heritage" | "Fun Activity" | "Dining" | "Rest",
      "description": string   // 1-3 sentences, journal voice, atmospheric
    }>
  }>,
  "tips": string[]            // 3-5 practical local tips tailored to the tier
}
Include 4-6 activities per day, mixing categories. Do not repeat places across days. 

CRITICAL: Use ONLY real, verified places that exist in ${data.destination}:
- Well-known attractions (temples, museums, parks, markets)
- Hidden gems (local restaurants, alleyways, viewpoints)
- Current events or seasonal activities
- All place names must be searchable on Google Maps/Places

Example good activity titles:
- "Fushimi Inari Taisha" (real shrine)
- "Philosopher's Path" (real walking trail)
- "Ouka Coffee" (real café)
- "Higashiyama District" (real neighborhood)

Avoid generic names like "local café" or "scenic spot" - use specific, real place names only.`;

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
    return {
      destination: p.destination ?? data.destination,
      tier: (p.tier as Itinerary["tier"]) ?? data.tier,
      travelers: p.travelers ?? data.travelers,
      days: Array.isArray(p.days) ? p.days : [],
      tips: Array.isArray(p.tips) ? p.tips : [],
    };
  });

// Server function to fetch place images from Google Places API
export const fetchPlaceImage = createServerFn({ method: "POST" })
  .inputValidator(
    (raw: unknown) =>
      z.object({ placeName: z.string().min(1).max(200), destination: z.string().min(1).max(120) }).parse(raw)
  )
  .handler(async ({ placeName, destination }): Promise<string | null> => {
    const apiKey = process.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!apiKey) return null; // Silently fail if API key missing

    try {
      // Search for the place using Text Search API
      const searchRes = await fetch("https://maps.googleapis.com/maps/api/place/textsearch/json", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: `${placeName} ${destination}`,
          key: apiKey,
        }),
      });

      if (!searchRes.ok) return null;

      type PlaceSearchResult = {
        results?: Array<{
          place_id?: string;
          photos?: Array<{ photo_reference: string }>;
        }>;
      };

      const searchData = (await searchRes.json()) as PlaceSearchResult;
      const place = searchData.results?.[0];
      if (!place?.photos?.[0]?.photo_reference) return null;

      const photoRef = place.photos[0].photo_reference;

      // Build photo URL using Places Photo API
      const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photoRef}&key=${apiKey}`;
      return imageUrl;
    } catch {
      return null; // Silently fail
    }
  });
