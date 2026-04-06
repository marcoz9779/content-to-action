# Architecture

## System Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│   Browser    │────▶│  Next.js App │────▶│ Job Process  │────▶│ Supabase │
│  (React UI)  │◀────│  Route Hdlrs │◀────│  AI Pipeline │◀────│ Postgres │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
                                                │
                                          ┌─────┴─────┐
                                          │  OpenAI    │
                                          │  Provider  │
                                          └───────────┘
```

## Layers

### Frontend (app/, components/)
- Next.js 15 App Router with React Server Components
- Client Components where interactivity is needed (forms, polling, copy/export)
- Tailwind CSS + shadcn/ui component library
- React Hook Form + Zod for form validation

### API Layer (app/api/)
- Next.js Route Handlers
- Zod-validated request/response
- Stateless — all state in database
- Triggers async job processing

### Job Processor (lib/jobs/)
- In-process async execution (queue-worker-ready structure)
- State machine: queued → fetching_source → transcribing → extracting_ocr → classifying → structuring → completed
- Updates progress in database
- Stores artifacts and final results

### AI Pipeline (lib/ai/)
- Provider abstraction for all AI capabilities
- Layered pipeline: normalize → transcribe → OCR → classify → extract
- Zod-validated AI outputs
- Separate prompt files per content type

### Data Layer (lib/supabase/, db/)
- Supabase Postgres with Row Level Security
- Supabase Storage for file uploads
- Server-side client uses service role key
- Client-side uses anon key with RLS

## Key Design Decisions

### Provider Abstraction
All AI capabilities are behind interfaces (`TranscriptionProvider`, `ClassificationProvider`, `ExtractionProvider`). This allows swapping OpenAI for another provider without changing pipeline logic.

### Discriminated Union Outputs
Structured outputs use `contentType` as a discriminant. Each content type has its own strongly-typed output shape. This ensures type safety from AI output parsing through to UI rendering.

### Job-Based Processing
Analysis is modeled as a job with status tracking. The frontend polls job status. This design supports future migration to a proper queue worker without changing the API or frontend.

### Anonymous-Friendly MVP
The app works without authentication. User ID is optional on jobs and results. Authentication can be layered in without restructuring.

## Directory Structure

```
app/                    # Next.js App Router pages and API routes
├── (marketing)/        # Landing page (route group)
├── app/                # Authenticated/app pages
├── api/                # API route handlers
components/             # React components
├── layout/             # App shell, navbar, footer
├── forms/              # Input forms
├── processing/         # Processing state UI
├── results/            # Result display components
├── shared/             # Shared utilities (buttons, badges)
├── ui/                 # shadcn/ui base components
lib/                    # Core business logic
├── ai/                 # AI pipeline
│   ├── providers/      # Provider implementations
│   ├── prompts/        # Prompt templates
│   ├── schemas/        # Zod schemas for AI outputs
├── jobs/               # Job processing
├── source/             # Platform detection, source resolution
├── storage/            # File upload handling
├── supabase/           # Supabase client setup
├── validation/         # Request validation schemas
├── exports/            # Export formatting
├── analytics/          # Event tracking
├── security/           # Input sanitization, env validation
├── utils/              # General utilities
├── constants/          # Shared constants and enums
db/                     # Database
├── migrations/         # SQL migration files
types/                  # Shared TypeScript types
tests/                  # Test files
├── unit/               # Vitest unit tests
├── e2e/                # Playwright e2e tests
docs/                   # Documentation
```

## Data Flow

### URL Analysis Flow
1. User submits URL + optional text → `POST /api/analyze`
2. Route handler validates input, creates job record, returns jobId
3. Job processor runs asynchronously through pipeline stages
4. Frontend polls `GET /api/jobs/:jobId` for status
5. On completion, frontend redirects to `GET /api/results/:resultId`

### Upload Analysis Flow
1. User uploads file → `POST /api/upload` → returns uploadPath
2. User submits uploadPath + optional text → `POST /api/analyze`
3. Same processing flow as URL analysis

### Export Flow
1. User requests export → `POST /api/export/:resultId`
2. Server formats result as text or JSON
3. Returns downloadable content
