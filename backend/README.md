# Payment Freelancer Backend

This backend is built to support your payment-freelancer app with a strong focus on:

- Node.js + TypeScript
- Secure auth flows
- Idempotent payment processing
- Easy migration to PostgreSQL in the future

## Recommended tech stack

- Node.js + TypeScript
- Express.js
- Prisma ORM
- SQLite for local development, PostgreSQL for production
- JWT auth

## Quick start

1. Open a terminal in `backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="change-me-to-a-strong-secret"
   ```
4. Run Prisma generate and migration:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

## API endpoints

- `POST /auth/register` - create a test user
- `POST /auth/login` - obtain JWT access token
- `GET /auth/me` - inspect authenticated user
- `POST /payments` - create idempotent payment with `x-idempotency-key`

## Idempotency

Send an `x-idempotency-key` header with payment requests. The backend will detect duplicate retries and return the original payment result instead of creating a second transaction.
