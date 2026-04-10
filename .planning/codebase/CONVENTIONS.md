# Conventions

## Coding Standards
- **Component Pattern**: Prefer Functional Components with TypeScript interfaces for props.
- **Server vs Client**: Use Server Components by default; add `"use client"` only for interactive components or hook usage.
- **Styling**: strictly use Tailwind CSS 4 utility classes. Prefer `cn()` utility for conditional classes.
- **UI Components**: Components are built using **shadcn/ui** primitives located in `src/components/ui`.

## Naming Conventions
- **Files**: PascalCase for React components, kebab-case for utility/logic files.
- **Directories**: kebab-case.
- **Routes**: kebab-case within `src/app`.

## State Management
- **Server State**: Managed via Next.js Server Components and Actions.
- **Global UI State**: Minimal hooks or React Context where necessary.
- **Form State**: Managed via `react-hook-form` and `zod` for validation.

## Git & Commits
- Commit messages should be descriptive (e.g., `feat: add attendance scanning`, `fix: hydration error in profile`).
