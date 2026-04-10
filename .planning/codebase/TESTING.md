# Testing

## Current Infrastructure
- **Linting**: ESLint configured via `eslint.config.mjs` and `eslint-config-next`.
- **Type Checking**: TypeScript strict mode enabled in `tsconfig.json`.

## UAT Criteria (User Acceptance Testing)
- **Authentication**: Successful login/logout and role-based redirect.
- **Attendance**: QR code generation and successful scan/record cycle.
- **Workflow**: Event creation → Approval → Registration → Completion.

## Future Plans
- **Integration Tests**: Suggest implementing Vitest or Playwright for critical user flows like payment and attendance scanning.
- **Test Harness**: A `test-harness` directory exists in `src/app/(dashboard)` for manual verification of components and flows.
