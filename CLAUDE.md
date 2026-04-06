# CLAUDE.md — Content to Action

Project-specific instructions for Claude Code sessions.

## First Steps in Any Session

1. Read this file
2. Read `README.md` for product context
3. Read `docs/architecture.md` for technical architecture
4. Run `npm run check` to verify current state

## Project Overview

Content to Action is a Next.js 15 App Router application that transforms short-form video content into structured, actionable output. Users paste a URL or upload a video, the app runs an AI pipeline (classify → extract), and returns typed structured results.

## Architecture Constraints — Do Not Change Casually

- **App Router**: All routes use Next.js App Router (`app/` directory). Do not introduce Pages Router.
- **Provider Abstraction**: AI services use provider interfaces (`lib/ai/providers/`). Never hardcode OpenAI calls directly in route handlers or components.
- **Discriminated Unions**: Structured outputs use discriminated unions on `contentType`. Do not flatten into generic objects.
- **Zod Validation**: All API inputs and AI outputs are validated with Zod. Never bypass validation.
- **TypeScript Strict**: `strict: true` in tsconfig. No `any` types unless absolutely unavoidable and documented.
- **Server/Client Boundary**: Respect `"use client"` directives. Keep data fetching in server components or route handlers.

## Coding Rules

- Use TypeScript strict mode — no `any`, no `as` casts without justification
- Use Zod for all external data boundaries (API input, AI output, env vars)
- Use shared constants from `lib/constants/` instead of magic strings
- Keep components small and focused — extract logic into hooks or utilities
- No logic-heavy JSX — compute values before the return statement
- Use semantic HTML and proper ARIA attributes
- Mobile-first responsive design with Tailwind

## Naming Conventions

- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- Types: `PascalCase` — `AnalysisJob`, `RecipeOutput`
- Constants: `SCREAMING_SNAKE_CASE` — `JOB_STATUS`, `CONTENT_TYPES`
- Zod schemas: `camelCase` with `Schema` suffix — `analyzeRequestSchema`
- API routes: RESTful — `GET /api/jobs/[jobId]`, `POST /api/analyze`

## Style Rules

- Tailwind CSS for styling — no CSS modules or styled-components
- shadcn/ui for base components
- Lucide for icons
- One primary accent color, neutral backgrounds
- Clean spacing, strong hierarchy

## How to Run Tests

```bash
npm test            # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright)
npm run check       # Lint + typecheck + unit tests
```

## How to Approach New Features

1. Check `docs/backlog.md` for context on planned features
2. Create a feature branch: `feature/description`
3. Update or create types in `types/`
4. Update Zod schemas if API contracts change
5. Implement backend logic in `lib/`
6. Implement API routes in `app/api/`
7. Implement UI in `components/` and `app/`
8. Add tests
9. Update documentation if architecture changed
10. Run `npm run check`
11. Create PR with clear description

## How to Update Docs When Code Changes

- If you add/change an API route → update `docs/api-contracts.md`
- If you change database schema → update `docs/database.md` and add migration
- If you change architecture → update `docs/architecture.md`
- If you add a new content type → update types, schemas, prompts, result components, and docs
- Always keep `README.md` in sync with major changes

## What Not to Change Casually

- Database schema (requires migration)
- AI prompt files (affects output quality — test thoroughly)
- Provider interfaces (affects all implementations)
- Type discriminated unions (affects all consumers)
- Environment variable names (affects deployment)
- API response shapes (affects frontend consumers)

## Common Patterns

### Adding a new content type
1. Add to `ContentType` union in `types/`
2. Add Zod schema in `lib/ai/schemas/`
3. Create extraction prompt in `lib/ai/prompts/`
4. Create result component in `components/results/`
5. Add case to result renderer
6. Update database check constraint via migration
7. Add tests

### Adding a new AI provider
1. Implement the provider interface in `lib/ai/providers/`
2. Add configuration in env vars
3. Update provider factory
4. Test with existing prompt suite
