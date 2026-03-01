# Quiz Hub (Next.js + NextAuth + MongoDB Atlas)

Full-stack quiz platform with authentication, role-based admin panel, quiz play, result history, and analytics.

## Tech Stack

- Next.js (App Router)
- NextAuth (Credentials)
- MongoDB + Mongoose
- React Hook Form + Zod
- TanStack Query
- Zustand
- Tailwind CSS + shadcn/ui

## Features

### Auth

- Register, login, logout
- Email verification
- Forgot/reset password
- Change password (profile)
- Role-based auth (`user`, `admin`)
- Toast notifications + confirmation dialogs

### User Quiz

- Start quiz by category
- Submit answers
- Result summary (correct/wrong counts)
- Per-question review (your answer vs correct answer)
- Result history with expandable details

### Admin

- Manage users
- Manage categories (create/view/edit/delete)
- Manage questions (create/view/edit/delete)
- Analytics dashboard
- Sidebar with grouped navigation sections

## Project Structure (important parts)

- `app/api/auth/[...nextauth]/route.ts` – NextAuth route
- `lib/auth.ts` – NextAuth config and callbacks
- `lib/mongodb.ts` – Mongo connection helper
- `models/*` – Mongoose models
- `app/api/admin/*` – admin APIs
- `app/api/quiz/*` – quiz APIs
- `app/*` – pages and UI
- `scripts/seed-users.mjs` – user seeder
- `scripts/seed-quiz.mjs` – quiz seeder

## Environment Variables

Create `.env.local`:

```dotenv
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_long_random_secret

SEED_USER_EMAIL=user@example.com
SEED_USER_PASSWORD=Password@123
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@123
```

Notes:

- Use MongoDB Atlas in production (and recommended locally too).
- `EMAIL_PASS` should be a Gmail App Password.
- Generate secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Atlas Setup Checklist

1. Create Atlas cluster.
2. Create database user with read/write access.
3. Add Network Access entry:
   - For quick start: `0.0.0.0/0`
4. Use Atlas connection string in `MONGO_URI`.

## Install & Run

```bash
npm install
npm run dev
```

If Turbopack causes issues:

```bash
npm run dev -- --webpack
```

## Seed Data

Seed default users:

```bash
npm run seed:users
```

Seed quiz categories + questions:

```bash
npm run seed:quiz
```

Current quiz seeder behavior:

- Clears existing categories/questions first
- Inserts only current seeded dataset

## Default Seeded Credentials

From `.env.local`:

- User: `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`
- Admin: `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`

## API Quick Check

After running app:

- `GET /api/test` should return Mongo connection success.

## Deploy to Vercel

1. Push project to GitHub.
2. Import repo into Vercel.
3. Add Environment Variables in Vercel:
   - `MONGO_URI`
   - `NEXTAUTH_URL` (your Vercel app URL)
   - `NEXTAUTH_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `NEXT_PUBLIC_BASE_URL` (optional, usually same as app URL)
4. Deploy.

## Post-Deploy Validation

- Register/login/logout
- Email verification flow
- Forgot/reset password
- Start and submit quiz
- View result history and details
- Admin access and CRUD flows

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run seed:users
npm run seed:quiz
```

## Troubleshooting

### Mongo connection issues

- Verify Atlas IP access list includes your source IP (or `0.0.0.0/0` for testing).
- Verify `MONGO_URI` username/password and db name.
- Ensure special chars in password are URL-encoded.

### NextAuth session/callback issues

- Confirm `NEXTAUTH_URL` matches the running app URL.
- Confirm `NEXTAUTH_SECRET` is set in every environment.

### Emails not sending

- Verify Gmail App Password and account settings.
- Check `EMAIL_USER` and `EMAIL_PASS`.

---

If you want, this README can be split into separate docs (`docs/auth.md`, `docs/admin.md`, `docs/deploy.md`) for easier maintenance.
