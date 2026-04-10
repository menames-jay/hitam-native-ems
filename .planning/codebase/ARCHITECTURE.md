# Architecture

## Overview
The HITAM-native EMS follows a **Serverless-First Modular Architecture**. It is built as a unified Next.js application leveraging the App Router for nested layouts and routing.

## Key Architectural Pillars
1. **Role-Based Governance**: The system is partitioned into dashboards based on 8 Institutional Roles (STUDENT, FACULTY, ADMIN, etc.).
2. **Event-Driven Workflows**: Asynchronous tasks like attendance locking and notifications are handled via Inngest to maintain frontend responsiveness.
3. **Mobile-First Design**: Primary interactions (QR scanning, attendance recording) are optimized for mobile web using Tailwind CSS 4 and shadcn/ui.
4. **Data layer Decoupling**: Database interactions are centralized in `src/lib/db` using Drizzle ORM, allowing for strict type safety and migrations.

## Data Flow
- **Client**: React Components (Client/Server) in `src/app`.
- **Logic**: Server Actions in `src/lib/actions` and Services in `src/services`.
- **Storage**: Supabase (Postgres) + Supabase Storage for assets.
- **Jobs**: Inngest workers processing events from the main app.
