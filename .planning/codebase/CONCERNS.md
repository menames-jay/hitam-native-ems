# Concerns

## Technical Debt
- **Feature Gap**: The `src/features` directory is currently empty, suggesting that domain-specific logic might still be clustered in `app/` or `components/`.
- **Hydration Errors**: Recent logs indicate hydration mismatches in the `profile` page, which need investigation (likely due to date formatting or browser-only APIs).

## Security
- **RBAC Enforcement**: Ensuring that `Better Auth` roles are strictly checked at both the middleware and component level.
- **Environment Variables**: Critical secrets (Supabase, Razorpay, Resend) must be managed carefully across local and production environments.

## Performance
- **Dashboard Load Times**: As the institutional hierarchy grows, complex queries for dashboards (especially for `ADMIN` or `AO` roles) might require optimization or caching strategy.
- **QR Scanning**: Browser compatibility and mobile camera access performance across different devices.

## Compliance & Governance
- **Attendance Lockdown**: Ensuring the 14-day lock logic (via Inngest) is infallible to maintain institutional integrity.
