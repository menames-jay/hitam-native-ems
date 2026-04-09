
# 📘 HITAM-native Event Management System (EMS)

## Full Product Requirements Document (PRD) – Final Version

**Product Name:** HITAM-native Event Management System (EMS)
**Institution:** Hyderabad Institute of Technology and Management (HITAM)
**Document Type:** Product Requirements Document
**Version:** Final
**Purpose:** Provide a complete specification for building the HITAM EMS system end-to-end.
**Target Implementer:** AI Coding Agent / Full-Stack Development Team

---

# 1. SYSTEM OVERVIEW

The **HITAM-native Event Management System (EMS)** is a centralized platform for managing events, attendance, approvals, venue allocation, registrations, payments, and analytics at HITAM.

The system is designed not just as an event platform but as an **institutional governance system** for:

1. Event governance
2. Attendance governance
3. Venue governance
4. Participation analytics

The EMS must integrate event participation with attendance adjustments through an **ERP-style attendance interface** and enforce institutional policies such as approval chains and 14-day attendance editing limits.

---

# 2. SYSTEM GOVERNANCE STRUCTURE

The EMS is built around **role-based governance**, not just user accounts.

## 2.1 Roles in the System

The system must support the following roles:

| Role                        | Description                            |
| --------------------------- | -------------------------------------- |
| Student                     | Regular student user                   |
| Club Coordinator            | Selected student who can create events |
| Faculty                     | Class teachers / faculty organizers    |
| Program Head                | Department academic head               |
| HOD                         | Head of Department                     |
| Lead SE                     | Student Engagement Head                |
| Administrative Officer (AO) | Venue allocation authority             |
| Super Admin                 | System administrator                   |

---

## 2.2 Authority Hierarchy

This hierarchy defines decision authority:

```text
Student
↓
Club Coordinator
↓
Faculty
↓
Program Head
↓
HOD
↓
Lead SE
↓
Administrative Officer
↓
Super Admin
```

This hierarchy must be used when designing:

* Approval workflows
* Permissions
* Dashboard access
* Visibility
* Overrides

---

# 3. EVENT TYPES

The system must support the following types of events:

1. Affinity Hour Events (Friday Afternoon / Saturday)
2. Club Events
3. Technical Workshops
4. Hackathons
5. Guest Lectures
6. Department Events
7. Institute Events
8. Paid Events
9. Fest Events
10. Competitions
11. Training Programs

Each event must belong to a **hosting department or club**.

---

# 4. EVENT CREATION PERMISSIONS

## 4.1 Who Can Create Events

| Role             | Can Create Events               |
| ---------------- | ------------------------------- |
| Student          | No                              |
| Club Coordinator | Yes (Club/Affinity events)      |
| Faculty          | Yes (Technical/Academic events) |
| Program Head     | Yes                             |
| HOD              | Yes                             |
| Lead SE          | Yes                             |

Regular students cannot create events.

Club Coordinators are **selected by Lead SE** and assigned to specific clubs.

---

# 5. EVENT APPROVAL WORKFLOWS

The EMS must support **multiple approval workflows depending on event type**.

---

## 5.1 Workflow A — Club / Affinity Events

These events are student engagement events organized by clubs.

### Workflow:

```text
Club Coordinator
→ Lead SE Approval
→ Administrative Officer (Venue Allocation)
→ Event Scheduled
```

### Description:

1. Club Coordinator creates event.
2. Event goes to Lead SE for approval.
3. Lead SE approves or rejects.
4. After approval, AO assigns venue.
5. Event becomes scheduled and open for registration.

Faculty, Program Head, and HOD are **not required** in this workflow unless manually added.

---

## 5.2 Workflow B — Technical / Department Events

These are academic or technical events organized by departments.

### Workflow:

Faculty
→ Program Head
→ HOD
→ Lead SE
→ Administrative Officer
→ Event Scheduled

### Description:

1. Faculty creates event.
2. Program Head checks academic relevance and schedule feasibility.
3. HOD checks department planning and resource allocation.
4. Lead SE checks institute calendar and engagement planning.
5. AO assigns venue.
6. Event becomes scheduled.

---

## 5.3 Workflow C — Institute Level Events

Events proposed by HOD or Lead SE.

### Workflow:

HOD / Lead SE
→ Lead SE Approval
→ Administrative Officer
→ Event Scheduled

IQAC/internal meetings happen **outside the system**, so the system only records approval.

---

# 6. EVENT LIFECYCLE STATES

Every event must move through defined states:

DRAFT
→ SUBMITTED
→ PENDING_APPROVAL (role-specific)
→ APPROVED
→ VENUE_ALLOCATED
→ REGISTRATION_OPEN
→ EVENT_COMPLETED
→ ATTENDANCE_REVIEW
→ ATTENDANCE_APPROVED
→ ARCHIVED

---

# 7. REGISTRATION SYSTEM

## 7.1 Free Events

Students click **Register** → Registration stored.

## 7.2 Paid Events

Students click **Pay & Register** → Payment gateway flow.

### Payment Flow:

Create Order
→ Redirect to Payment Gateway
→ Payment Success
→ Verify Signature
→ Create Registration
→ Store Payment Record

Students cannot attend paid events unless payment is successful.

---

# 8. QR ATTENDANCE SYSTEM

## 8.1 Attendance Flow

Organizer Starts Attendance
→ System Generates QR Token
→ Students Scan QR
→ Attendance Stored
→ Manual Corrections Allowed
→ Data Sent to Faux ERP Module

## 8.2 Attendance Record Fields

attendance_id
student_id
session_id
check_in_time
check_out_time
status
source (qr/manual)
marked_by

QR tokens must expire every few minutes.

## 8.3 Manual Attendance Code (Fallback Attendance Method)

In addition to QR-based attendance, the system must support a manual attendance code entry system as a fallback mechanism.

Requirements:
When attendance session starts, system generates:
QR Code
Manual Attendance Code
Both correspond to the same session token

Students may either:
Scan QR code, OR
Enter the manual code

Manual code must:
Be 6–8 characters
Be alphanumeric
Be case-insensitive
Expire after session ends
System must prevent duplicate attendance marking
System must verify student registration before marking attendance

Attendance Flow with Manual Code:
Organizer Starts Attendance
→ System Generates Session Token
→ System Generates QR Code
→ System Generates Manual Code
→ Students Scan QR OR Enter Code
→ Attendance Recorded
→ Session Ends → Code Expires

Database Requirement:

Attendance session must store:

session_id
event_id
token
manual_code
start_time
end_time
is_active

Manual code system must enforce:

Code expires after session
Student must be registered
Student cannot mark twice
Code cannot be reused for another session
All manual entries must be logged

---

# 9. FAUX ERP ATTENDANCE MODULE

This module replicates the **existing ERP attendance workflow**.

## Faculty Workflow:

1. Login
2. Attendance → Mark Attendance
3. Select Class
4. Select Date
5. Load Attendance Table
6. Checkbox to mark Present
7. Enter Class/Topic/Reason
8. Submit Attendance
9. Review Modal
10. Confirm
11. Attendance submitted

### Table Layout:

| S.No | Roll No | Name | Present Checkbox |

This interface must remain **simple and ERP-like**, not modernized heavily.

---

# 10. ATTENDANCE APPROVAL WORKFLOW

Attendance approval workflow:


QR Attendance
→ Organizer Review
→ Faculty ERP Attendance
→ Program Head Approval
→ Attendance Locked

Program Head approves attendance corrections.
HOD does not approve daily attendance but can view reports.

---

# 11. 14-DAY RULE (MANDATORY SYSTEM RULE)

## Attendance Editing Window

editing_deadline = event_end_date + 14 days

After 14 days:

* Attendance cannot be edited
* Attendance cannot be approved
* Attendance becomes final

## Event Visibility Window

visible_until = event_end_date + 14 days

After 14 days:

* Event hidden from dashboards
* Event archived
* Only Admin can view archived events

System must automatically enforce this via scheduled jobs.

---

# 12. DASHBOARDS

## Student Dashboard

* Upcoming Events
* Affinity Events
* My Registrations
* Scan QR
* My Participation

## Club Coordinator Dashboard

* Create Event
* Edit Event
* Submit Event
* Registrations
* Attendance Management
* Event Analytics

## Faculty Dashboard

* ERP Attendance
* Attendance Submissions
* Technical Event Creation
* Pending Approvals

## Program Head Dashboard

* Department Event Approvals
* Attendance Approvals
* Department Calendar
* Department Analytics

## HOD Dashboard

* Department Reports
* Event Calendar
* Participation Analytics
* Attendance Reports
* Monthly Reports

## Lead SE Dashboard

* Club Event Approvals
* Institute Calendar
* Engagement Analytics
* Affinity Hour Management

## AO Dashboard

* Venue Allocation Queue
* Room Schedule
* Conflict Resolution

## Admin Dashboard

* User Management
* Role Management
* Venue Management
* Payment Logs
* Archived Events

---

# 13. DATABASE TABLES (CORE)

The system must include the following core tables:

* Users
* Roles
* Events
* EventApprovals
* EventSessions
* Venues
* VenueAllocations
* Registrations
* PaymentRecords
* AttendanceTokens
* AttendanceRecords
* AttendanceSubmissions
* AuditLogs

All actions must be logged.

---

# 14. SYSTEM AUTOMATIONS

The system must include scheduled background jobs:

1. Lock attendance after 14 days
2. Archive events after 14 days
3. Expire QR tokens
4. Send approval reminders
5. Send attendance deadline reminders
6. Send event reminders
7. Generate periodic reports

---

# 15. UI / UX DESIGN DIRECTIVES

The UI must be:

* Clean
* Modern
* Minimal
* Aesthetic
* Professional
* Accessible
* Mobile-first

Dashboards should use:

* Cards
* Tables
* Modals
* Soft color palette
* Clear typography

**Exception:** Faux ERP Attendance View must remain traditional and simple.

---

# 16. SYSTEM ARCHITECTURE (HIGH LEVEL)

System components:

* Frontend Web App
* Backend API Server
* Database
* Payment Gateway Integration
* QR Token Service
* Scheduler / Cron Jobs
* Notification Service

---

# 17. SUCCESS METRICS

The system is successful if:

* Faculty finalize attendance in EMS
* Program Heads approve attendance digitally
* Events follow approval workflows
* Venue conflicts reduce
* Participation data available
* Paid events processed successfully
* Attendance edits stop after 14 days
* Departments use analytics

---

# 18. FINAL PRODUCT VISION

The HITAM-native EMS should become:

> The official institutional platform that manages all events, attendance adjustments, participation analytics, and engagement governance at HITAM.

It should function as:

* Event Management System
* Attendance Governance System
* Engagement Analytics Platform
* Approval Workflow System
* Venue Scheduling System
* ERP Attendance Companion System

---
