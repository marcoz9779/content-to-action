# Content to Action

Paste short-form content. Get something you can actually use.

## Product

Content to Action transforms chaotic short-form video content from Instagram, TikTok, Facebook, YouTube Shorts into structured, actionable output. Instead of just summarizing a cooking video, it gives you a real recipe with ingredients, amounts, and a shopping list. Instead of summarizing a business tip, it gives you action items, frameworks, and tools.

## Why It Exists

Short-form video is the dominant content format, but it's ephemeral and hard to act on. You watch a recipe reel, close the app, and forget the ingredients. You see a business framework explained in 60 seconds but can't recall the steps. Content to Action bridges that gap — turning passive consumption into structured action.

## Core User Flows

1. **URL Analysis** — Paste a URL from a supported platform, optionally add caption/comment text, and receive structured output.
2. **Video Upload** — Upload an MP4/MOV/WebM file directly for analysis when URL processing isn't available.
3. **Result Usage** — View structured results, copy to clipboard, export as text or JSON, save for later.
4. **Failure Handling** — Clear error messages with fallback suggestions (e.g., upload instead of URL).

## Supported Content Types

| Type | Key Outputs |
|------|-------------|
| **Recipe** | Title, summary, ingredients with amounts, shopping list by category, preparation steps |
| **Business** | Title, summary, key learnings, action items, frameworks, tools mentioned |
| **DIY** | Title, summary, materials, tools, steps, estimated effort |
| **Workout** | Title, summary, exercises, reps/sets/duration, workout structure |
| **Other** | Title, summary, key points, suggested actions |

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Icons | Lucide |
| Database | Supabase Postgres |
| Storage | Supabase Storage |
| Auth | Supabase Auth (anonymous-friendly MVP) |
| AI | OpenAI (GPT-4o) |
| Testing | Vitest + Playwright |
| Deployment | Vercel + Supabase |

## Architecture

```
User → Next.js Frontend → API Route Handlers → Job Processor → AI Pipeline → Supabase
```

- **Frontend**: React Server Components + Client Components where needed, App Router
- **API Layer**: Next.js Route Handlers with Zod validation
- **Job System**: In-process async with status tracking (queue-worker-ready structure)
- **AI Pipeline**: Layered architecture with provider abstraction — normalize → transcribe → OCR → classify → extract → persist
- **Database**: Supabase Postgres with RLS policies
- **Storage**: Supabase Storage for uploaded video files

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Getting Started

### Prerequisites

- Node.js >= 20
- npm
- Supabase project (free tier works)
- OpenAI API key

### Environment Setup

```bash
cp .env.example .env
```

Fill in your environment variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL_CLASSIFY` | Model for classification (default: `gpt-4o-mini`) |
| `OPENAI_MODEL_EXTRACT` | Model for extraction (default: `gpt-4o`) |
| `APP_URL` | Application URL (default: `http://localhost:3000`) |
| `MAX_UPLOAD_MB` | Max upload size in MB (default: `50`) |
| `NODE_ENV` | Environment (`development` / `production`) |

### Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Migrations

Apply migrations using the Supabase CLI:

```bash
supabase db push
```

Or run the SQL files in `db/migrations/` manually against your Supabase project.

### Testing

```bash
# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# End-to-end tests
npm run test:e2e

# All checks (lint + typecheck + tests)
npm run check
```

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Set all environment variables in Vercel project settings
3. Deploy — Vercel auto-detects Next.js

### Supabase

1. Create a Supabase project
2. Run migrations from `db/migrations/`
3. Create a storage bucket named `uploads` with appropriate policies
4. Enable Row Level Security on all tables

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions.

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch (optional, add when team grows) |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `chore/*` | Maintenance, deps, config |

## Commit Convention

```
feat: add recipe result component
fix: handle empty transcript in extraction
refactor: simplify job processor state machine
docs: update API contracts for export endpoint
test: add unit tests for platform detection
chore: update dependencies
```

## How to Work with Claude Code in This Repo

1. Always read `CLAUDE.md` first — it contains project-specific rules
2. Read `README.md` and `docs/architecture.md` for full context
3. Follow the existing App Router structure
4. Preserve provider abstraction patterns in `lib/ai/`
5. Never bypass Zod validation or weaken TypeScript strictness
6. Run `npm run check` before declaring work complete
7. Update docs when architecture changes
8. Prefer small, focused commits with conventional commit messages

## Known Limitations

- URL-based content fetching is limited — not all platforms allow direct access. Upload flow is the reliable path.
- AI extraction quality depends on transcript/caption quality
- No user authentication in initial MVP (anonymous-friendly)
- No real-time collaboration or sharing
- Single-language support (English) in initial release
- No caching of results across users for identical URLs

## Future Roadmap

See [docs/backlog.md](docs/backlog.md) for the full backlog.

- Multi-language support
- Browser extension for one-click capture
- Authenticated user accounts with result history
- Team sharing and collaboration
- Webhook integrations (Notion, Todoist, etc.)
- Rate limiting and usage tiers
- Content type plugins for community extensions
