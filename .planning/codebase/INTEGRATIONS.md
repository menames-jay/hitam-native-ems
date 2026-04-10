# Integrations

## Third-Party Services

### 1. Supabase
- **Role**: Primary Database and File Storage.
- **Connection**: Managed via `DATABASE_URL` and `SUPABASE_URL`.
- **Driver**: Using `postgres` package for direct connection and Drizzle ORM for schema management.

### 2. Better Auth
- **Role**: Authentication and Session Management.
- **Config**: Rooted in `src/lib/auth.ts` and `src/lib/auth-client.ts`.
- **Middleware**: Used for protecting dashboard routes.

### 3. Razorpay
- **Role**: Payment gateway for event registrations.
- **Integration**: Server-side order creation and client-side checkout.
- **Webhooks**: Verified via signature to confirm payments.

### 4. Resend
- **Role**: Transactional email delivery.
- **Use Cases**: Registration confirmations, password resets, and notifications.

### 5. Inngest
- **Role**: Event-driven background jobs.
- **Key Tasks**: Event archival, attendance locking, and reminder scheduling.

## Deployment Platforms
- **Vercel**: Primary hosting for the Next.js application.
- **Supabase**: Hosted PostgreSQL.
