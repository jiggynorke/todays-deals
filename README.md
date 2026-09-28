# Today's Deals

A live deals page that lists the day's best discounts, sorted by biggest savings, with hot deals (45%+ off) flagged.

**Live site:** https://todays-deals.vercel.app

## Tech stack

- **Next.js 16 (App Router) + React 19 + TypeScript**: server-rendered page
- **Tailwind CSS**: styling
- **Supabase (Postgres)**: deals database with row-level security
- **Vercel**: hosting, with automatic deploys from GitHub

## How it works

```
Supabase "deals" table  ──read on every request──▶  Next.js server component  ──▶  Vercel
```

- **Server-side data fetching.** The page is a React Server Component that queries Supabase on the server, so no database logic ships to the browser.
- **Always fresh.** The page renders per request (`connection()`) rather than being pre-built at deploy time, so new rows in the database appear immediately without a redeploy.
- **Read-only public access.** Row-level security is enabled on the table, with a single policy that allows `select` only. The public key can read deals but cannot insert, update, or delete.
- **Discount logic.** Percent off is calculated from sale and original prices, guarding against missing or zero values. Deals are sorted by biggest discount, and those without a discount go last.
- **Error and empty states.** A failed query or an empty table shows a clear message instead of a broken page.

## Development workflow

- Changes are made on feature branches and merged through **pull requests**.
- Every PR gets its own **Vercel preview deployment** for testing before merge. Merging to `main` deploys to production automatically.
- Practiced **production rollback** both ways: Vercel Instant Rollback for immediate recovery, and `git revert` for a permanent fix in the codebase.
- Built with **AI-assisted development (Claude Code)**. All generated code was reviewed before commit.

## Roadmap

- [ ] **Live data ingestion:** a scheduled job (Vercel Cron) pulling daily promo pricing from the Kroger Products API and upserting it into Supabase
- [ ] **Manual deal entry:** an authenticated admin page for in-store and coupon deals the API doesn't cover
- [ ] **Filters:** by store, category, and percent off

## Run locally

1. Create a Supabase project with a `deals` table (`title`, `store`, `price`, `original_price`, `url`, `created_at`), enable RLS, and add a public read policy.
2. Create `.env.local` in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000
