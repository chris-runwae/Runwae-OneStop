# Runwae UI Roadmap & Future Features

This document provides a detailed explanation of the intended functionality for the UI elements that are currently disabled or hidden. This serves as both a development backlog and a feature guide for the product roadmap.

---

## ❤️ Favorites & Saving (Heart Icon)
The heart icon is currently hidden on all cards (Itineraries, Events, Destinations) and detail headers.

### Future Functionality:
*   **One-Tap Save**: Users can "heart" any item to add it to their personal library.
*   **Dedicated Favorites Tab**: A new section in the User Profile will house all saved items, categorized by type (Trips, Experiences, Destinations).
*   **Quick Re-access**: Allow users to quickly revisit potential destinations or events when planning a future trip.
*   **Backend Integration**: Will use a `favorites` table in Supabase to persist these relationships per user.

---

## 📤 Advanced Sharing (Upload Icon)
Individual sharing buttons on detail headers are currently hidden to prevent fragmented sharing experiences.

### Future Functionality:
*   **Deep-Linking**: Clicking "Share" will generate a universal link that opens the specific event or itinerary directly in the Runwae app (or the App Store if not installed).
*   **Dynamic Social Cards**: Integrated with a service to generate eye-catching images (Social Cards) containing the title, price, and cover photo—perfect for Instagram Stories or WhatsApp updates.
*   **Trip Invites**: In the context of a Trip, the share button will generate a unique "Join Code" and link to invite friends to collaborate on an itinerary.

---

## 🔑 Social Authentication (OAuth Buttons)
Google, Apple, and Facebook buttons on the Onboarding screen are temporarily hidden.

### Future Functionality:
*   **Frictionless Entry**: Allow users to bypass the email verification step by using trusted social identities.
*   **Account Linking**: Enabling existing users to link their email accounts to social providers for faster subsequent logins.
*   **Profile Auto-Fill**: Automatically fetching the user's name and profile picture from the social provider to skip Step 1 of the Boarding flow.

---

## 📋 Action Menu Enhancements
The ellipsis (...) menu in the `ItineraryHeader` currently has some hidden or simplified options.

### Future Functionality:
*   **Collaborative Control**: Dynamic permissions—"Delete Trip" will only be visible to owners, while "Leave Trip" will be visible to members.
*   **Offline Support**: Ensuring these management actions work smoothly with an offline-first cache, syncing with Supabase as soon as connectivity returns.

---

*Last Updated: 2026-04-22*
