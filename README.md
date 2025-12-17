<h1 align="center">Lumen AI Studio</h1>

Design, compare, and ship AI-driven messaging with live templates, model insights, and a polished chat workspace. Built with **Next.js (App Router) + TypeScript + Tailwind v4**.

> 📌 Deliverables checklist  
> ✔️ Full TypeScript source (strict mode)  
> ✔️ Research → Design → Development notes (below)  
> ✔️ Mock API (`/app/api/*`) serving models & templates  
> ✔️ Accessible + responsive UI with animations  
> ⏳ Storybook intentionally omitted per client request

---

## 1. Research

| Area | Notes |
| --- | --- |
| Platforms reviewed | Vercel AI SDK, Anthropic Console, Notion AI, Typeface |
| Chosen features | Template rail, model comparison desk, timeline-style chat, theme toggle, JSON export |
| Tailwind mapping | Soft desert color palette via CSS custom properties, rounded “pill” buttons (`EdgeButton`), glassmorphic containers |

## 2. Design

- **Figma / XD mockup:** _Insert share link or screenshots here_  
- **Responsive grid:** `lg:grid-cols-[280px_minmax(0,1fr)_320px]` keeps template, chat, and model panes visible on desktop; collapses to stacked layout <1024px.  
- **Motion system:** floating gradient background + hover translations; focus-visible outlines for keyboard users.  
- **Theme system:** custom `ThemeProvider` persists preference in `localStorage` and syncs to `data-theme` attributes for CSS vars.

## 3. Development

1. **Data & Mock API**
   - `/app/api/templates/route.ts` & `/app/api/models/route.ts` stream typed JSON with simulated latency.
   - Strong typing via `data/templates.ts` and `data/models.ts`.
2. **State & Hooks**
   - `useResource<T>()` handles loading/error/refetch per endpoint.
   - Chat history leverages optimistic placeholder messages plus `synthesizeResponse()` for mock output.
3. **Accessibility + UX**
   - Buttons and cards expose `focus-visible` outlines, aria labels, and keyboard navigation.
   - Copy/export actions announce state visually (e.g., “Copied” label).
   - Theme toggle announced via icon swap + aria label.
4. **Limitations**
   - No real AI inference—responses are synthetic.
   - Storybook skipped (not required for this submission); components live directly in `app/`.

---

## Getting Started

```bash
npm install
npm run dev
# visit http://localhost:3000
```

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run built app |
| `npm run lint` | ESLint with Next config |

---

## Tech Highlights

- Next.js 16 (App Router) with React 19
- Tailwind CSS v4 (classless `@import "tailwindcss"` pipeline)
- Custom theming via CSS variables
- Reusable `EdgeButton`, `ThemeProvider`, `useResource` hook
- Mock data served through API routes for parity with real fetch flows

---

## Assets & Documentation

- **Mock data:** see `/data/*.ts`
- **Icons:** inline SVG (Sun/Moon) within `app/page.tsx`
- **Screenshots:** _Add exported PNGs or embed via Markdown once captured_

---

## Deployment

Deploy on Vercel or any Next-compatible host:

```bash
npm run build
npm run start
```

Set `NODE_ENV=production` and ensure the `/app/api/*` routes remain enabled.
