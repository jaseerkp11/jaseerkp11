# Commerce platform

Configurable Indian ecommerce + resale storefront with an admin console. The default display name is **Atria** and is driven by environment variables so the brand can change without a rewrite.

This repository started as an empty GitHub profile README. There was no existing Next.js app to preserve. The live URL `novara-storefront.vercel.app` returned 404 at audit time.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS 4
- Prisma + SQLite for local development (free)
- Server-validated cart, coupons, tax, and checkout
- JWT httpOnly sessions (hashed passwords, bcrypt)
- Vercel-ready (`vercel.json`, security headers)

## Architecture

| Layer | Location |
| --- | --- |
| UI | `src/app`, `src/components` |
| Brand / domain | `src/config/brand.ts`, `NEXT_PUBLIC_*` |
| Business logic | `src/lib/services`, `src/lib/money.ts`, `src/lib/permissions.ts` |
| Payments | `src/lib/payments/provider.ts` (COD live; Razorpay stub until keys exist) |
| Shipping | `src/lib/shipping/provider.ts` (pincode table; no fake tracking) |
| Search | `src/lib/search/provider.ts` (swap later for Meilisearch/Algolia) |
| Email | `src/lib/notifications/email.ts` |
| Imports | `src/lib/imports/products.ts` (preview only) |
| Database | `prisma/schema.prisma` |

Reseller-ready tables: `Role.RESELLER`, `ResellerProfile`, `Product.resellerEligible`. Payouts are not simulated.

## Launch (before real customers)

You can take **cash on delivery** orders on the live site now. Do this in Admin:

1. **Settings** — GSTIN (if you have it), business address, WhatsApp, shipping fees.
2. **Content** — read About / Privacy / Terms / Shipping / Returns and put your real city and rules.
3. **Categories** then **Products** — add your catalogue (main + 4 extra photo URLs).
4. **Orders** — Confirm → Packed → Shipped (add tracking) → Delivered (marks COD as paid). Print **Invoice / packing slip**.
5. Optional later: Razorpay keys for UPI, Resend for order emails, custom domain in Vercel.

Do not re-run seed on the live database; it wipes products and orders.

## Local setup

```bash
cp .env.example .env
# set AUTH_SECRET and NEXT_PUBLIC_SITE_URL
npm install
npm run db:setup
npm run dev
```

Seeded accounts (local only):

- Admin: `admin@local.test` / `ChangeMe_admin_123`
- Customer: `asha@local.test` / `Customer_123`

Change these before any public deployment.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment variables

See `.env.example`. Required in production:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL` (canonical origin, no trailing slash)

Optional: Razorpay keys, SMTP/Resend, brand colours, support contacts, logo URL.

## Vercel

1. Import this GitHub repository.
2. Framework: Next.js. Build command: `npm run build`.
3. Add the environment variables from `.env.example`.
4. **Database:** SQLite on Vercel does not persist writes across serverless invocations. Create a free [Neon](https://neon.tech) or [Turso](https://turso.tech) database, set `DATABASE_URL`, and change `provider` in `prisma/schema.prisma` to `postgresql` (Neon) or use the libSQL adapter (Turso). Then run `prisma db push` and `npm run db:seed` against that database once.
5. Set `NEXT_PUBLIC_SITE_URL` to the production origin (`https://your-project.vercel.app` or your custom domain).
6. Custom domain: Vercel → Project → Settings → Domains. The app reads the public URL from env, not from hard-coded `vercel.app` hosts.

### Cleaner `*.vercel.app` URL

Renaming `something-storefront.vercel.app` to `brandname.vercel.app` is a **Vercel dashboard** action, not a git change:

1. Vercel → Project → Settings → General → **Project Name**.
2. The default `project-name.vercel.app` follows the project name if that subdomain is still free.
3. Confirm no redirect loop with the custom domain.
4. Update `NEXT_PUBLIC_SITE_URL` to match.

A custom `.com` is purchased at a registrar (not free; availability is not claimed here) and attached in Vercel Domains.

## Payments

Cash on delivery creates a real `PENDING` / `COD_PENDING` order. Inventory is reserved. The order is not marked paid until staff set status to `DELIVERED` (or you connect a gateway webhook).

Razorpay is disabled until `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set. Checkout will not show a fake UPI success.

## Images

Seed imagery is original SVG generated in `public/images/products`. Admin can attach additional image URLs. Local disk uploads are not used on Vercel; use URLs or a blob store later.

## License

Private business use unless you add a license file.
