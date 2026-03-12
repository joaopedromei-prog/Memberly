# Memberly App

Plataforma de area de membros estilo Netflix para The Scalers.

## Development

```bash
# From root directory
npm run dev

# Or from packages/memberly-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests |
| `npm run test:watch` | Watch mode |
| `npm run typecheck` | TypeScript check |

## Deploy (Vercel)

1. Connect repository to Vercel
2. Set **Root Directory** to `packages/memberly-app`
3. Set **Framework Preset** to Next.js
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Push to main = automatic deploy

## Tech Stack

- Next.js 16+ (App Router, Turbopack)
- React 19+
- TypeScript (strict mode)
- Tailwind CSS v4
- Zustand 5.x
- Supabase (DB, Auth, Storage)
- Vitest + React Testing Library
