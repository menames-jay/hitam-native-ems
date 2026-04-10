# Structure

## File System Layout

### Root Directory
- `hitam-native-ems/`: Main application directory.
- `prd.md`, `tech-stack.md`, `design-doc.md`: High-level project documentation.

### Source Directory (`hitam-native-ems/src/`)
- `app/`: Next.js App Router root.
    - `(auth)/`: Authentication routes (login, register, etc.).
    - `(dashboard)/`: Role-specific and module-specific dashboards.
        - `admin/`, `faculty/`, `student/`: Role portals.
        - `events/`, `attendance/`, `approvals/`: Core modules.
    - `api/`: API routes (including Better Auth handlers).
- `components/`: Shared UI components (mostly shadcn).
- `features/`: Module-specific components and logic (currently being populated).
- `hooks/`: Custom React hooks.
- `lib/`: Core libraries (Auth, DB, Utils).
    - `actions/`: Next.js Server Actions.
    - `db/`: Drizzle schema and client.
- `services/`: Business logic and service layer.
- `styles/`: Global CSS and Tailwind configuration.

### Other Directories
- `drizzle/`: Database migrations.
- `public/`: Static assets (images, fonts).
- `scripts/`: Maintenance and utility scripts.
