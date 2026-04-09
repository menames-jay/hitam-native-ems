# HITAM-native Event Management System (EMS)

# Technical Stack & Architecture Document

# 1. System Overview

The HITAM-native Event Management System (EMS) is a mobile-first web application that manages:

Event creation and approvals
Registrations and payments
QR and manual code attendance
ERP-style attendance review
Attendance approvals
Venue allocation
Dashboards and analytics
Notifications and reminders
Event archival and reporting

The system will follow a modern full-stack web architecture using serverless hosting, managed database services, and event-driven background jobs.

# 2. High-Level Architecture

## System Architecture Overview

Frontend (Next.js)
        |
        |
Better Auth (Authentication)
        |
        |
Supabase (Database + Storage + Edge Functions)
        |
        |---- Razorpay (Payments)
        |---- Resend (Emails)
        |---- Inngest (Background Jobs / Queues)
        |
Vercel (Deployment)

# 3. Frontend Stack

## Frontend Framework

The frontend will be built using:

Next.js (App Router)
React
TypeScript
Tailwind CSS
shadcn/ui

Responsibilities of Frontend

The frontend application will handle:

User dashboards
Event browsing and registration
Event creation forms
Approval screens
QR scanning
Manual attendance code entry
Faux ERP attendance interface
Analytics dashboards
Profile and settings
Dark mode / light mode
Bottom navigation (mobile)
Sidebar navigation (desktop)
UI Libraries

Tool	Purpose
Tailwind CSS	Styling
shadcn/ui	UI components
Lucide	Icons
React Hook Form	Forms
Zod	Form validation
Recharts	Analytics charts
html5-qrcode	QR scanning

# 4. Authentication (Better Auth)

Authentication will be handled using Better Auth.

Authentication Features Required
Email + password login
Role-based access control
Session management
Secure cookies
Password reset
Invite users by email
Role assignment
Persistent sessions
Middleware protection for routes

Roles in System
STUDENT
STUDENT_COORDINATOR
FACULTY
PROGRAM_HEAD
HOD
LEAD_SE
AO
ADMIN

Better Auth will store:

Users
Sessions
Password hashes
Roles
Permissions

# 5. Backend & Database (Supabase)

Supabase will be used for:

PostgreSQL database
File storage
Edge functions (if needed)
Realtime features (optional)
Row-level security (RLS)
Database triggers
Scheduled functions

## Database: PostgreSQL (Supabase)

The database will store:

Users
Roles
Events
Event approvals
Event sessions
Registrations
Payments
Attendance records
Attendance sessions (QR/manual code)
ERP attendance submissions
Venues
Venue allocations
Notifications
Audit logs
Reports

Supabase will act as the primary backend data layer.

# 6. Payments (Razorpay)

Razorpay will be used for paid event registrations.

## Payment Flow

Student clicks Pay & Register
→ Create Razorpay Order
→ Open Razorpay Checkout
→ Payment Success
→ Razorpay Webhook
→ Verify Signature
→ Create Registration
→ Store Payment Record
Payment Data Stored
payment_id
order_id
student_id
event_id
amount
status
timestamp
refund_status

# 7. Email System (Resend)

Resend will be used for sending emails.

## Email Use Cases

Emails must be sent for:

Event registration confirmation
Payment confirmation
Reminder emails for upcoming events
Password reset emails
User invitation emails

# 8. Background Jobs & Messaging (Inngest)

Inngest will be used for:

Background jobs
Scheduled tasks
Event-driven workflows
Queue processing
Jobs to Run Using Inngest
1. Lock attendance after 14 days
2. Archive events after 14 days
3. Send event reminder emails
4. Process Razorpay webhooks
5. Generate reports
6. Notification processing
7. Attendance session expiry

This prevents long-running tasks from blocking the main application.

# 9. QR Attendance System Architecture

## Attendance Session Flow

Organizer Starts Attendance
→ Create Attendance Session
→ Generate Token
→ Generate QR Code
→ Generate Manual Code
→ Students Scan QR OR Enter Code
→ Attendance Recorded
→ Session Ends
→ Token Expires
Attendance Session Fields
session_id
event_id
token
manual_code
start_time
end_time
is_active

# 10. Faux ERP Attendance System Architecture

## ERP Attendance Flow

QR Attendance Completed
→ Faculty Opens ERP Attendance
→ System Auto-Fills Present Students
→ Faculty Adjusts Attendance
→ Faculty Submits Attendance
→ Program Head Reviews
→ Program Head Approves
→ Attendance Locked

# 11. File Storage

Supabase Storage (or S3) will store:

Event posters
Event documents
Certificates
Reports
Profile pictures

# 12. Deployment

## Deployment Stack

Frontend → Vercel
Backend/DB → Supabase
Payments → Razorpay
Emails → Resend
Background Jobs → Inngest
Storage → Supabase Storage

This is a modern serverless architecture.

# 13. Environment Variables Required

BETTER_AUTH_SECRET
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RESEND_API_KEY
INNGEST_EVENT_KEY
NEXT_PUBLIC_APP_URL

# 14. Folder Structure (Frontend)

src/
  app/
  components/
  features/
    auth/
    dashboard/
    events/
    registrations/
    attendance/
    approvals/
    payments/
    venues/
    reports/
    analytics/
    notifications/
  lib/
  hooks/
  services/
  styles/

# 15. System Modules

The system should be divided into modules:

Auth Module
User Module
Role Module
Event Module
Approval Module
Registration Module
Payment Module
Attendance Module
ERP Attendance Module
Venue Module
Notification Module
Analytics Module
Report Module
Admin Module
Archive Module

# 16. Final Tech Stack Summary

## Final Stack

Frontend:
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui

Auth:
Better Auth

Backend / Database:
Supabase (PostgreSQL)

Payments:
Razorpay

Emails:
Resend

Background Jobs:
Inngest

Deployment:
Vercel

Storage:
Supabase Storage

Charts:
Recharts

QR Scanner:
html5-qrcode

# 17. Architecture Philosophy

The system follows:

Mobile-first UI
Role-based access
Approval workflows
Event-driven architecture
Background job processing
Serverless deployment
Modular backend design
Attendance governance model
Institutional workflow automation