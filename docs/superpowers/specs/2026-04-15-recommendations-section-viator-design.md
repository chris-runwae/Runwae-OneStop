# RecommendationsSection — Viator Integration Design
_Date: 2026-04-15_

## Overview

Replace the hardcoded `ADD_ONS_FOR_YOU` mock data in `RecommendationsSection` with live Viator products filtered to the current destination. Add a working Stay tab backed by the hotel search API. Ensure the "Add to Trip" button in every card saves to the user's real active trips.

---

## Files Changed

| File | Change |
|---|---|
| `mobile/utils/savedIdeaInputs.ts` | Add `savedItemFromViatorIdea` and `savedItemFromHotel` helpers |
| `mobile/components/destination/RecommendationCard.tsx` | Swap `AddOn` → `MappedViatorIdea`; update navigation; add price badge |
| `mobile/components/destination/RecommendationsSection.tsx` | Full refactor — destination prop, Viator data, hotel Stay tab |
| `mobile/screens/destinations/DestinationDetailsScreen.tsx` | Pass `destination` prop to `<RecommendationsSection />` |

---

## Data Flow

```
DestinationDetailsScreen
  └─ destination (from useDestinationById)
       └─ RecommendationsSection(destination)
            ├─ lookupViatorDestinationId(destination.title) → destinationId
            ├─ [All/Eat/Drink/Do/Shop tabs]
            │    └─ useViatorCategory(cat, destinationId) → MappedViatorIdea[]
            │         └─ RecommendationCard (per item)
            │              └─ AddToTripContent modal → addIdeaToTrip(tripId, savedItemFromViatorIdea(item))
            └─ [Stay tab]
                 └─ useHotels(destination.title, tomorrow, dayAfter, 2, null) → hotels
                      └─ HotelRecommendationCard (inline, per item)
                           └─ AddToTripContent modal → addIdeaToTrip(tripId, savedItemFromHotel(hotel))
```

---

## Component Design

### RecommendationsSection

**New prop:**
```ts
interface RecommendationsSectionProps {
  destination: { title: string; location: string };
}
```

**Category tabs:**
```
All | 🍹 Eat/Drink | 🏨 Stay | 🎭 Do | 🛍️ Shop
```

**Internal state:**
- `activeCategory: 'All' | 'Eat/Drink' | 'Stay' | 'Do' | 'Shop'`
- `destinationId: string | null` — resolved on mount via `lookupViatorDestinationId(destination.title)`

**Per-tab content (all rendered as horizontal FlashLists):**
- All: `useViatorCategory('All', destinationId)` — merged union of all leaf categories
- Eat/Drink / Do / Shop: `useViatorCategory(cat, destinationId)`
- Stay: `useHotels(destination.title, tomorrow, dayAfterTomorrow, 2, null)`

Loading and error states are shown inline within the list area (spinner or retry button).

### RecommendationCard (updated)

- Prop changes: `item: AddOn` → `item: MappedViatorIdea`
- `item.image` → `item.imageUri`
- Navigation: `/experience/${item.id}` → `/viator/${item.id}`
- Add-to-trip: `savedItemFromAddOn(item)` → `savedItemFromViatorIdea(item)`
- Price badge: show `From $XX` below description when `item.price != null`

### HotelRecommendationCard (inline in RecommendationsSection)

Matches `RecommendationCard` dimensions (177px wide). Shows:
- Hotel thumbnail image
- "🏨 Stay" badge (top-left overlay)
- Hotel name (title, 1 line)
- Address (description, 2 lines)
- "From $XX" price + "Add" button

Taps "Add" → opens `AddToTripContent` modal → `addIdeaToTrip(tripId, savedItemFromHotel(hotel))`.

---

## Add-to-Trip

`AddToTripContent` already correctly:
- Calls `refreshMyTrips()` + `refreshJoinedTrips()` on mount
- Merges `myTrips` + `joinedTrips` (deduped) into a selectable list
- Submits via `onDone(selectedTripId)` callback

No changes needed to `AddToTripContent`. Each card manages its own modal visibility state.

---

## New Helpers in savedIdeaInputs.ts

```ts
export function savedItemFromViatorIdea(idea: MappedViatorIdea): CreateSavedItemInput {
  return {
    name: idea.title,
    type: 'activity',
    location: idea.category,
    external_id: idea.id,
    cover_image: idea.imageUri,
    notes: idea.description,
  };
}

export function savedItemFromHotel(hotel: LiteAPIHotelRateItem): CreateSavedItemInput {
  const roomTypes = hotel.roomTypes?.length ?? 0;
  return {
    name: hotel.name,
    type: 'hotel',
    location: 'Stay',
    external_id: hotel.hotelId,
    cover_image: hotel.thumbnail ?? null,
    notes: `${hotel.address} | ${roomTypes} room${roomTypes !== 1 ? 's' : ''}`,
    all_data: hotel,
  };
}
```

---

## Constraints

- `lookupViatorDestinationId` is called once on mount; result cached in-module.
- Hotel dates default to tomorrow / day-after-tomorrow with 2 adults — no trip context available on the destination screen.
- `HotelRecommendationCard` is defined inline in `RecommendationsSection.tsx` (single-use component, no separate file).
- No changes to `AddToTripContent`, `TripsContext`, or `useHotels`.
