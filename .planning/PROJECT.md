# HITAM Native EMS - Project Context

## What This Is
The **HITAM-native Event Management System (EMS)** is a centralized platform for managing institutional governance across events, attendance, approvals, and venue allocation at the Hyderabad Institute of Technology and Management (HITAM). 

It specifically integrates event participation with academic attendance records through a "Faux ERP" interface and enforces strict institutional rules like the 14-day attendance editing window.

## Core Value
To provide a stable, role-aware governance platform that automates complex institutional workflows while ensuring attendance integrity and venue conflict resolution.

## Current Context
- **Status**: Brownfield (Core architecture and role dashboards established).
- **Recent Mapping**: Identified Next.js 16/React 19 stack with Better Auth, Supabase, and Inngest.
- **Top Priority**: Resolution of technical debt (hydration errors, slow rendering) and stabilizing the multi-role dashboard system.

---

## Requirements

### Validated
- ✓ **Role-Based Auth**: Integrated Better Auth with roles (STUDENT, FACULTY, ADMIN, etc.).
- ✓ **Institutional Hierarchy**: Authority chains defined in `src/app/(dashboard)`.
- ✓ **Modular Data Layer**: Drizzle ORM schemas for events, sessions, and registrations.

### Active
- [ ] **Hydration Fix**: Resolve "Profile" page hydration mismatches and rendering errors.
- [ ] **Build Performance**: Optimize Next.js compilation and rendering speeds.
- [ ] **Attendance Stability**: Ensure QR/Manual token generation is robust.
- [ ] **Institutional Workflows**: Finalize approval chains for technical vs. club events.

### Out of Scope
- [ ] **Native Mobile App**: Current focus is Mobile-First Web.
- [ ] **External Integration**: Direct syncing with the *actual* HITAM ERP (system remains "Faux ERP" mode for now).

---

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 | Latest features, server actions, and App Router stability. | Active |
| Better Auth | Modern, type-safe auth with multi-role support. | Validated |
| Inngest | Robust event-driven background job processing for "14-day rule". | Validated |

---
*Last updated: April 10, 2026 after project initialization*

## Evolution
This document evolves at phase transitions and milestone boundaries.
