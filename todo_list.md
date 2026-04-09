# HITAM EMS Implementation To-Do List

Based on the Product Requirements Document (PRD), Technical Stack, and UI/UX Design System, here is a structured to-do list separated by project phases.

## 1. Project Initialization & Setup
- [x] Initialize Next.js (App Router) project with React, TypeScript, and Tailwind CSS.
- [x] Install and configure `shadcn/ui` components and `lucide-react` icons.
- [x] Set up the specified folder structure under `src/` (`app/`, `components/`, `features/`, `hooks/`, `lib/`, `services/`, `styles/`).
- [x] Set up environment variables (`BETTER_AUTH_SECRET`, `SUPABASE_URL`, `RAZORPAY_KEY_*`, `RESEND_API_KEY`, etc.).

## 2. Infrastructure & Database (Supabase)
- [x] Initialize Supabase project and PostgreSQL database.
- [x] Create core tables: `Users`, `Roles`, `Events`, `EventApprovals`, `EventSessions`, `Venues`, `VenueAllocations`, `Registrations`, `PaymentRecords`, `AttendanceTokens`, `AttendanceRecords`, `AttendanceSubmissions`, and `AuditLogs`.
- [ ] Set up Row-Level Security (RLS) policies and database triggers.
- [ ] Configure Supabase Storage buckets for event posters, certificates, and profiles.

## 3. Authentication & Roles (Better Auth)
- [x] Configure Better Auth for email/password authentication.
- [x] Implement system roles (`STUDENT`, `STUDENT_COORDINATOR`, `FACULTY`, `PROGRAM_HEAD`, `HOD`, `LEAD_SE`, `AO`, `ADMIN`).
- [x] Create middleware for route protection based on authentication and role hierarchy.
- [ ] Set up user invites and password reset flows with Resend.

## 4. UI/UX & Design System
- [x] Implement a global Theme System (Light & Dark mode toggle with preference saving).
- [x] Build the mobile-first persistent Bottom Navigation Bar.
- [x] Build the Desktop Left Sidebar and Top Notification Bar.
- [x] Create core reusable components (Rounded Cards, Summary Cards, Data Tables with Search/Pagination, Confirm Modals, Status Badges).
- [x] Ensure thumb-friendly, low-cognitive-load layouts.

## 5. Dashboards Development
- [ ] **Student Dashboard:** Upcoming events, Scan QR shortcut, participation metrics.
- [ ] **Club Coordinator Dashboard:** Event creation, attendance management, event analytics.
- [ ] **Faculty Dashboard:** ERP Attendance module, pending approvals, technical event creation.
- [ ] **Program Head & HOD Dashboards:** Department event tracking, calendar views, analytics.
- [ ] **Lead SE & AO Dashboards:** Event approvals, affinity hour usage, venue allocation queue.
- [ ] **Admin Dashboard:** Role assignment, master data management, system logs.

## 6. Event Management Module
- [ ] Implement step-by-step event creation forms (Data Flow & Submissions).
- [ ] Build Role-Specific Approval Workflows (Workflow A, B, and C).
- [ ] Track and manage event lifecycle states (DRAFT to ARCHIVED).
- [ ] Implement responsive Global Calendar Views (Month, Week, Day).

## 7. Registration & Payments (Razorpay)
- [ ] Create free event registration flow.
- [ ] Integrate Razorpay for paid event registrations.
- [ ] Implement Razorpay Webhooks to verify payment signatures and securely update registration status.

## 8. Attendance Systems
- [x] **QR System Setup:** (Components exist like QRScanner).
- [ ] **QR System Data Flow:** Create attendance session token generation, server-side display, and student scanning logic.
- [ ] **Manual Override System:** Generate 6-8 character expiration fallback codes for manual entry.
- [ ] **Faux ERP System:** Build the traditional layout table (S.No, Roll No, Name, Present Checkbox) for Faculty to review attendance.
- [ ] Implement the Attendance Approval Workflow moving from Organizer -> Faculty -> Program Head.

## 9. Background Jobs & Constraints (Inngest)
- [ ] Configure Inngest client and event triggers.
- [ ] Automate the **"14-Day Rule"**: Lock attendance editing and archive events automatically after 14 days.
- [ ] Automate QR Token expiry and session closure.
- [ ] Build scheduled jobs for reminder emails and periodic data reporting.

## 10. Notifications (Resend)
- [ ] Integrate Resend for transactional emails.
- [ ] Build email templates for registrations, successful payments, upcoming event reminders, and auth reset flows.

## 11. Testing & Deployment
- [ ] Test cross-role authorization and workflows.
- [ ] Deploy the Frontend to Vercel.
- [ ] Conduct end-to-end user UI tests on mobile breakpoints.
