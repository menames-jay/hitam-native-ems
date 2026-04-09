
---

# HITAM-native Event Management System (EMS)
UI / UX Design Document (Mobile-First, Bottom Navigation, Dark Mode)
Design Reference

The EMS design language is inspired by modern mobile dashboard apps like the Plant Care UI concept, which focuses on clean dashboards, calm color palettes, scan-first workflows, and simple navigation.
Modern mobile UX patterns such as bottom navigation, card layouts, and minimal interfaces are widely used because they create intuitive navigation and consistent user experience across devices.

# 1. Design Philosophy

The HITAM EMS should look and feel like:

A modern mobile productivity app
A SaaS dashboard
A campus engagement platform
A scheduling and analytics app
An ERP companion system
Core Design Principles

The UI must be:

Mobile-first
Clean
Minimal
Modern
Aesthetic
Green
Card-based
Dashboard-driven
Role-based
Accessible
Low cognitive load
Fast to navigate
Thumb-friendly
Design Keywords

Use these design keywords for UI generation:

mobile-first dashboard
bottom navigation app
green minimal UI
soft shadows
rounded cards
light and dark mode
card-based layout
calendar dashboard
analytics cards
modern green SaaS mobile UI
ERP table interface
QR scanner screen
institutional app UI

---

# 2. Navigation Architecture

# 2.1 Mobile Navigation – Bottom Navbar (Primary Navigation)

The mobile app must use a bottom navigation bar similar to modern mobile apps.

Bottom Navbar Items
Icon	Section
Home	Dashboard
Events	Events
Scan	QR Attendance
Approvals	Approvals / Attendance
Profile	Profile / Settings
Bottom Navbar Layout
--------------------------------
| Home | Events | Scan | Approvals | Profile |
--------------------------------
Rules
Scan button should be highlighted.
Navbar must be persistent.
Navigation must be thumb-friendly.
Each role sees different content inside the same sections.

# 2.2 Desktop Navigation

On desktop:

Bottom navbar becomes left sidebar
Top bar contains profile and notifications
Desktop Layout
----------------------------------------
| Top Bar                               |
----------------------------------------
| Sidebar | Main Content                |
----------------------------------------

# 3. Theme System (Light Mode + Dark Mode)

## 3.1 Theme Requirements

The app must support:

Light Mode (Default)
Dark Mode
Theme toggle in Profile
Save theme per user
Remember theme on login

# 3.2 Light Mode Colors

Element	Color
Background	Off White
Cards	White
Text	Dark Gray
Accent	Blue / Teal
Border	Light Gray
Success	Green
Warning	Amber
Error	Red

Light mode must feel:

Clean
Institutional
Calm
Professional

# 3.3 Dark Mode Colors

Element	Color
Background	Dark Gray
Cards	Dark Gray (lighter)
Text	White / Light Gray
Accent	Soft Blue
Border	Medium Gray
Success	Green
Warning	Amber
Error	Red

Dark mode must feel:

Comfortable
Modern
Not high contrast
Not pure black

# 4. Layout System

## Mobile Screen Layout Structure
--------------------------------
| Page Title                   |
--------------------------------
| Content Area                 |
| Cards / Tables / Forms       |
|                              |
--------------------------------
| Bottom Navigation Bar        |
--------------------------------

# 5. Dashboard Design System

Every role must have a dashboard.

## Dashboard Components

Dashboards must include:

Summary cards
Quick actions
Pending approvals
Calendar preview
Recent activity
Notifications
Dashboard Layout Example
--------------------------------
| Summary Cards                |
--------------------------------
| Calendar Preview             |
--------------------------------
| Pending Approvals            |
--------------------------------
| Recent Activity              |
--------------------------------

## Summary Card Layout

Each card must contain:

Icon
Title
Number / count
Small description

Example cards:

Events This Week
Pending Approvals
Attendance Submissions
Participation Count
Affinity Hour Usage

# 6. Event UI Design

## Event Cards (Mobile)

Events should be shown as cards.

## Event Card Layout
--------------------------------
Event Name
Date | Time
Venue
[ Free ] / [ Paid ]
Organizer
[ Register ]
--------------------------------
Event Details Screen

Should contain:

Event banner
Description
Date / Time
Venue
Organizer
Registration button
Payment button (if paid)
Sessions
Attendance info

# 7. QR Attendance Screen (Important)

Attendance screen must support:

QR Scan
Manual Code Entry
QR Screen Layout
--------------------------------
Scan Attendance
--------------------------------
[ Camera Scanner ]
--------------------------------
Having trouble scanning?
Enter Code Instead
--------------------------------
Event Name
Session Time
--------------------------------

# 8. Manual Code Entry Screen

--------------------------------
Enter Attendance Code
--------------------------------
[ _ _ _ _ _ _ ]
--------------------------------
Event Name
Session Time
--------------------------------
[ Submit ]
--------------------------------

Manual code must be generated along with QR code.

# 9. Faux ERP Attendance Screen Design

This screen must be simple and ERP-like.

Select Class: [Dropdown]
Select Date: [Date Picker]
Slot: [Regular / Affinity]

-----------------------------------------
| S.No | Roll No | Name | Present [ ] |
-----------------------------------------

Class / Topic / Reason:
[________________________________]

[ Submit Attendance ]
Review Modal
Present Students: 38

21XX01 – Student A
21XX02 – Student B

Cancel | Confirm

# 10. Approvals Screen Design

Approvals displayed as cards:

--------------------------------
Event Name
Submitted By
Date
Status: Pending

[ Approve ] [ Reject ]
--------------------------------

This screen changes depending on role:

Club Coordinator → Approval status
Faculty → Attendance submissions
Program Head → Event + Attendance approvals
Lead SE → Club event approvals
AO → Venue allocation approvals

# 11. Calendar UI

Calendar must be available for:

Department events
Institute events
Venue scheduling
Affinity hour planning

Calendar views:

Month
Week
Day

# 12. Profile & Settings Screen

Profile screen must include:

Name
Role
Department
Email
Theme toggle (Light / Dark)
Notifications toggle
Logout
Help / Support

# 13. Component Design System

Reusable components required:

Component	Usage
Cards	Dashboards
Tables	Attendance
Modals	Confirmations
Dropdown	Filters
Date Picker	Event dates
Calendar	Events
Charts	Analytics
Bottom Navbar	Navigation
Sidebar	Desktop
QR Scanner	Attendance
Toggle Switch	Dark Mode
Status Badge	Pending/Approved
Search Bar	Lists
Pagination	Tables

# 14. UX Rules (Very Important)

Bottom navbar must always be reachable.
Scan must be accessible within one tap.
Cards instead of tables on mobile.
Every approval must have confirmation dialog.
Every table must have search.
Every dashboard must show summary cards.
Avoid long forms — use step forms.
Use status badges everywhere.
Keep spacing large and clean.
Important actions must be thumb reachable.

# 15. Final UI Vision Summary

The HITAM EMS should visually feel like a mix of:

Notion
Linear
Modern SaaS dashboard
University portal
Calendar app
Analytics dashboard
ERP attendance system
Mobile productivity app
Visual Identity Summary
Mobile-first green web app
Bottom navigation
Card-based dashboards
Soft shadows
Rounded cards
Light & Dark mode
Calendar interface
QR scan screen
ERP attendance table
Analytics cards
Clean typography
Minimal UI

---
