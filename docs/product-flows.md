# Product Flows

## Flow 1: URL Analysis

1. User opens homepage
2. User clicks "Analyze Content" CTA or navigates to `/app/new`
3. User pastes a supported URL (Instagram, TikTok, Facebook, YouTube)
4. User optionally adds caption text and/or comment text
5. User clicks "Analyze"
6. App validates input (URL format, platform detection)
7. App sends `POST /api/analyze` with `sourceType: "url"`
8. App receives `jobId`, redirects to `/app/jobs/:jobId`
9. Processing page polls `GET /api/jobs/:jobId` every 2 seconds
10. Progress bar and step indicators update in real time
11. On completion, app redirects to `/app/results/:resultId`

## Flow 2: Video Upload Analysis

1. User navigates to `/app/new`
2. User drags or selects a video file (MP4, MOV, WebM)
3. App uploads file via `POST /api/upload`
4. App shows upload progress
5. User optionally adds caption and comment text
6. User clicks "Analyze"
7. App sends `POST /api/analyze` with `sourceType: "upload"` and `uploadPath`
8. Same processing and result flow as URL analysis

## Flow 3: Result Usage

1. User lands on `/app/results/:resultId`
2. User sees:
   - Content type badge (Recipe, Business, DIY, etc.)
   - Confidence score badge
   - Title and summary
   - Structured output sections (type-specific)
   - Warning cards for uncertain data
   - Missing information section
3. User can:
   - Copy full result to clipboard
   - Export as plain text or JSON
   - Save result (if authenticated)
   - Start a new analysis

## Flow 4: Failure Handling

### URL Processing Failure
- If platform is unsupported → show "Platform not supported. Try uploading the video directly."
- If URL cannot be resolved → show "Could not access this content. Try uploading the video or pasting the caption."
- If transcription fails → attempt analysis with caption/comment text only, note reduced confidence

### Upload Processing Failure
- If file is invalid → show clear validation error
- If file is too large → show size limit message
- If analysis fails → show error with retry option

### General Failures
- All errors show user-friendly messages (no stack traces)
- Failed jobs are recorded with error message for debugging
- Users always have a clear next action (retry, upload, or paste text)

## Flow 5: Saved Results (Authenticated)

1. User navigates to `/app/saved`
2. User sees list of previously saved results
3. User can filter by content type
4. User can search by title
5. User can click to view full result
6. Empty state shown if no saved results
