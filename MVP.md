# Runwae – 2 Week Engineering Plan
Team Size: 2–3 Engineers
Sprint Duration: 14 Days
Goal: Functional MVP (Web + Vendor Dashboard + Core Backend)

---

# Sprint Goal

Deliver:

- User Web App (Trips + Vendor Booking)
- Vendor Dashboard (Service CRUD + Booking View)
- Stripe Integration
- RLS-secured backend

---

# Team Roles

Engineer A / C – Backend / Supabase / Payments
Engineer B – Web App (User)
Engineer C – Vendor Dashboard + UI Polish (Optional if 3rd engineer)
Engineer D - Mobile App (User)

---

# Week 1 – Core Infrastructure

## Day 1–2
- Finalize DB schema
- Implement migrations
- Implement RLS policies
- Setup staging environment

Deliverable:
- All tables created
- Role-based access working

---

## Day 3–4
Engineer A:
- Implement Stripe Integrations*
- Error handling 
- Test trips CRUD

Engineer B & D:
- Auth flow (signup/login)
- Home page layout

Engineer C:
- Vendor dashboard skeleton

Deliverable:
- Auth working
- Home screens
- Stripe test mode working*
- Trips API

---

## Day 5–7
Engineer B and D:
- Trips UI

Engineer C:
- Vendor onboarding form
- Vendor profile creation

Deliverable:
- Users can create trips
- Trip utilities
- Vendors can register

---

# Phase 2 – Booking & Vendor Flow

## Day 8–9
Engineer A:
- Service listing CRUD endpoints *
- Booking logic

Engineer B & D:
- Explore tab
- Event browsing pages
- Service detail pages

Engineer C:
- Vendor service management UI

Deliverable:
- Services visible on web
- Explore tab

---

## Day 10–11
Engineer A:
- Stripe checkout integration complete *
- Booking status update logic

Engineer B:
- Booking confirmation UI

Engineer C:
- Vendor booking view

Deliverable:
- End-to-end booking flow working

---

## Day 12–13
- Testing
- RLS validation
- Edge case testing
- Fix critical bugs

---

## Day 14
- Production deploy
- Smoke testing
- Analytics integration

---

# Definition of Done

- User can:
  - Sign up
  - Create trip
  - Invite member
  - Add expense
  - Book vendor service

- Vendor can:
  - Register
  - Create service
  - See bookings

- * Payments:
  - Successful payment confirms booking
  - Failed payment does not create booking

---

# Risks

- Stripe webhook misconfiguration
- RLS policy mistakes
- Overbuilding UI
- Scope creep

---

# Strict MVP Scope

NO:
- AI features
- Escrow logic
- Advanced analytics
- Mobile web optimization polish

Focus = working marketplace + group planning core.

---
