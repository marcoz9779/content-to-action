# Deployment

## Vercel (Frontend + API)

### Setup

1. Push your repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Vercel auto-detects Next.js — no build configuration needed

### Environment Variables

Set these in Vercel project settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only, never expose |
| `OPENAI_API_KEY` | Yes | Server-only |
| `OPENAI_MODEL_CLASSIFY` | Yes | e.g., `gpt-4o-mini` |
| `OPENAI_MODEL_EXTRACT` | Yes | e.g., `gpt-4o` |
| `APP_URL` | Yes | Your production URL |
| `MAX_UPLOAD_MB` | No | Default: 50 |

### Deployment

- `main` branch auto-deploys to production
- Feature branches get preview deployments
- No additional build steps required

### Limits

- Vercel serverless functions have a 10-second default timeout (60s on Pro)
- AI processing may need longer — consider Vercel's maxDuration setting or background functions for production

## Supabase (Database + Storage)

### Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Note your project URL and keys from Settings → API

### Database Migrations

Apply migrations from `db/migrations/` using one of:

```bash
# Option A: Supabase CLI
supabase link --project-ref your-project-ref
supabase db push

# Option B: Manual SQL
# Copy and run each migration file in the Supabase SQL Editor
```

### Storage

1. Go to Storage in Supabase dashboard
2. Create a bucket named `uploads`
3. Set the bucket to private (not public)
4. Add a storage policy allowing uploads:
   - Allow `INSERT` for all users (anonymous uploads in MVP)
   - Allow `SELECT` for service role only

### Row Level Security

RLS is enabled by the migrations. Verify all tables have RLS enabled in the Supabase dashboard under Authentication → Policies.

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Storage bucket created with correct policies
- [ ] RLS enabled on all tables
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up (optional)
- [ ] Verify health endpoint: `GET /api/health`

## Monitoring

- Vercel provides built-in function logs and analytics
- Supabase provides database and auth logs
- `analytics_events` table captures app-level events
- Health endpoint at `/api/health` for uptime monitoring
