# 🌍 Google Places API Integration - Setup Guide

## What Changed

Your Ephemera project ab **real-time dynamic images** support karta hai har place, event, aur attraction ke liye!

### Architecture:

1. **Google Places API** — Real, verified place data + photos
2. **Image Fetching** — Dynamic search with destination context
3. **Caching Strategy** — Images cache hote hain 30 minutes tak session mein
4. **Fallback Handling** — Agar API down ho to graceful degradation

---

## Files Updated

### 1. **Core Functions**
- `src/lib/itinerary.functions.ts`
  - Added `fetchPlaceImage()` server function
  - Updated Gemini prompt to use real, searchable place names
  - Added proper validation for place names

### 2. **Frontend Hook**
- `src/hooks/use-place-image.ts`
  - Replaced Wikipedia API with Google Places API
  - Uses `useSuspenseQuery` for seamless image loading
  - Integrated with TanStack Query for caching

### 3. **Type Definitions**
- Updated `ItineraryActivity` type to include `imageUrl` field
- Added support for place references

### 4. **Environment Setup**
- `.env.example` — Added `VITE_GOOGLE_PLACES_API_KEY` placeholder
- `.env.local` — Created template with instructions

---

## Setup Steps (3 Minutes)

### Step 1: Get Google Places API Key

1. **Google Cloud Console** mein jao:
   - https://console.cloud.google.com/

2. **New Project** create karo (or existing use karo):
   - Project name: "Ephemera" (ya jo chahiye)
   - Click "Create"

3. **APIs Enable karo**:
   - Search: "Places API" → Enable
   - Search: "Maps JavaScript API" → Enable
   - Search: "Geocoding API" → Enable (optional, but recommended)

4. **API Key Create karo**:
   - Left menu: "Credentials"
   - Click: "Create Credentials" → "API Key"
   - Copy the key

5. **Restrict the Key** (Security best practice):
   - Edit the API key
   - Under "Application restrictions": Select "HTTP referrers (web sites)"
   - Add your domain: `localhost:*` (development) aur production URL
   - Under "API restrictions": Select "Places API", "Maps JavaScript API"

### Step 2: Add to `.env.local`

```bash
# Already exists, just fill in:
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
VITE_GEMINI_API_KEY=your_gemini_key_here  # if not already set
```

### Step 3: Test It

```bash
npm run dev
# Navigate to /planner
# Enter destination, duration, travelers
# Generate itinerary
# Watch images load real-time! 🎉
```

---

## How It Works

### Flow Diagram:

```
User enters destination
         ↓
Gemini AI generates day-by-day itinerary
(with real place names)
         ↓
Each activity's place name extracted
         ↓
Google Places Text Search API called
(searches: "placeName + destination")
         ↓
First result's photo reference extracted
         ↓
Places Photo API returns image URL
         ↓
Image preloaded & cached for 30 min
         ↓
React component renders with <img>
```

### Example Flow:

```
Input: "Kyoto, Japan" for 3 days

Activity Generated:
  title: "Fushimi Inari Shrine"
  time: "07:30"
  category: "Cultural Heritage"
  description: "Ten thousand torii gates..."

→ Searches: "Fushimi Inari Shrine Kyoto, Japan"
→ Gets: Photo of actual Fushimi Inari from Google
→ Displays: Real, verified image
```

---

## Image Fetching Logic

### Server Function: `fetchPlaceImage(placeName, destination)`

```typescript
// Input:
{
  placeName: "Fushimi Inari Shrine",
  destination: "Kyoto, Japan"
}

// Process:
1. Search via Google Places Text Search API
2. Query: "Fushimi Inari Shrine Kyoto, Japan"
3. Get first result's place_id
4. Extract photo_reference from result
5. Build URL via Places Photo API with maxwidth=600px

// Output:
"https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=..."
```

### Caching Strategy:

```typescript
useSuspenseQuery({
  queryKey: ["place-image", placeName, destination],
  staleTime: Infinity,        // ✅ Never re-fetch same place
  gcTime: 30 * 60 * 1000,     // 30 min memory retention
  retry: 1,                    // One graceful retry
})
```

---

## Pricing & Limits

### Google Places API Pricing:

- **Text Search**: $7 per 1000 queries
- **Photos**: Free (included with place data)
- **Free Tier**: $300/month credit ✅ (covers ~40k requests)

### Usage Estimate:
- Each itinerary generation: ~15-20 image searches
- $0.10-0.15 per trip generated
- ₹8-12 per trip (approx)

### Optimize Costs:
- Images are cached → same place = no new request
- Batch requests intelligently
- Monitor usage: Google Cloud Console → "Quotas"

---

## Troubleshooting

### ❌ "No image found"

**Cause**: Place name not recognized by Google Places

**Solution**:
```
- Use official, well-known names
- Include location context
- Examples:
  ✅ "Taj Mahal, Agra"
  ❌ "white building"
  
  ✅ "Colosseum, Rome"
  ❌ "ancient ruins"
```

### ❌ "API Key Invalid"

**Cause**: Missing or incorrect key in `.env.local`

**Solution**:
```bash
# Check .env.local:
echo $VITE_GOOGLE_PLACES_API_KEY

# Re-copy from Google Cloud Console
# Restart dev server:
npm run dev
```

### ❌ Images not loading (Slow network)

**Feature**: Component uses `Suspense` + error boundaries
- Shows skeleton while loading
- Falls back to MapPin icon if image fails
- Never crashes the page ✅

### ❌ 429 Error (Rate limit)

**Cause**: Too many requests to Google API

**Solution**:
- Google throttles at quota limit
- Wait a moment, retry
- Check Google Cloud usage

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_GEMINI_API_KEY` | AI itinerary generation | `sk-proj-...` |
| `VITE_GOOGLE_PLACES_API_KEY` | Real-time place photos | `AIzaSyD...` |

---

## File Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `src/lib/itinerary.functions.ts` | Added `fetchPlaceImage()` server fn | Fetches images from Google |
| `src/hooks/use-place-image.ts` | Replaced Wikipedia → Google Places | Real, verified images |
| `.env.example` | Added API key template | Setup documentation |
| `.env.local` | Created with instructions | Local config |
| `src/lib/itinerary.functions.ts` | Enhanced Gemini prompt | Forces real place names |

---

## Testing Checklist

- [ ] `.env.local` mein dono API keys fill hain
- [ ] `npm run dev` successfully starts
- [ ] Navigate to `/planner`
- [ ] Enter: Destination="Paris", Days=3, Travelers=2
- [ ] Click "Generate Itinerary"
- [ ] Images load alongside activities ✨
- [ ] Change destination, new images appear 🎯
- [ ] No errors in browser console
- [ ] Image load time < 2 seconds per image

---

## Next Improvements (Future)

- [ ] Image carousel per activity (multiple photos)
- [ ] Place ratings from Google
- [ ] Click-to-open in Google Maps
- [ ] User-uploaded images option
- [ ] Image gallery view
- [ ] Generate print-ready PDF with images

---

## Support & Resources

- **Google Places API Docs**: https://developers.google.com/maps/documentation/places/web-service/overview
- **Google Cloud Console**: https://console.cloud.google.com/
- **Quotas & Usage**: https://console.cloud.google.com/apis/dashboard
- **API Key Security**: https://cloud.google.com/docs/authentication/api-keys

---

**Ready to launch! 🚀**

Ab har place ka real image dikhega aur user ka travel planning experience bilkul next-level hoga!
