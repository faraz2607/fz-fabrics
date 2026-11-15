# FabriTrack

FabriTrack helps fabric businesses manage organization workspaces, employees, thread and fabric activity, production counts, earnings, payments, and billing.

## Platform Super Admins

Set `SUPER_ADMIN_USER_IDS` in the server environment to a comma-separated list of up to three existing MongoDB user IDs. These accounts receive the global Super Admin role and can manage users across organizations. This role is controlled only by server configuration; it cannot be assigned from signup or the user interface. If more than three IDs are configured, the allowlist is rejected and no account receives Super Admin access. Provision the accounts first, then add their immutable IDs to this server-only setting.

Before deploying these access controls, apply the MongoDB schema updates with `npm run db:push` and regenerate the Prisma client with `npm run prisma:generate`. The additions include user activation and password-reset settings, plus organization activation status.

## Branding and SEO

Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin of the deployed app (for example, `https://app.yourdomain.com`). FabriTrack uses it as the metadata base and Open Graph URL so shared links resolve correctly on WhatsApp and other social platforms.

Brand and preview assets live in `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`, and `app/manifest.ts`. Update the SVG and image route when changing the logo, browser icon, installed-app icon, social preview, or PWA name. Page titles and search descriptions are configured in `app/layout.tsx` and the individual `app/auth/*/page.tsx` files. `app/robots.ts` and `app/sitemap.ts` control crawler access and the public signup/login sitemap.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
