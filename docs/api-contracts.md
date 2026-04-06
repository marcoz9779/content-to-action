# API Contracts

## POST /api/upload

Upload a video file for analysis.

**Request**: `multipart/form-data`
- `file` — MP4, MOV, or WebM. Max size defined by `MAX_UPLOAD_MB`.

**Response 200**:
```json
{
  "uploadPath": "uploads/abc123-video.mp4"
}
```

**Errors**:
- `400` — Invalid file type or missing file
- `413` — File too large
- `500` — Storage error

---

## POST /api/analyze

Start a new analysis job.

**Request**:
```json
{
  "sourceType": "url" | "upload",
  "sourceUrl": "https://instagram.com/reel/...",   // required if sourceType=url
  "uploadPath": "uploads/abc123-video.mp4",         // required if sourceType=upload
  "captionText": "optional caption text",
  "commentText": "optional comment text"
}
```

**Response 200**:
```json
{
  "jobId": "uuid",
  "status": "queued"
}
```

**Errors**:
- `400` — Validation error (details in response body)
- `500` — Job creation failed

---

## GET /api/jobs/:jobId

Poll job status.

**Response 200**:
```json
{
  "id": "uuid",
  "status": "classifying",
  "progressPercent": 65,
  "errorMessage": null,
  "resultId": null
}
```

When completed:
```json
{
  "id": "uuid",
  "status": "completed",
  "progressPercent": 100,
  "errorMessage": null,
  "resultId": "uuid"
}
```

**Errors**:
- `404` — Job not found

---

## GET /api/results/:resultId

Fetch analysis result.

**Response 200**:
```json
{
  "id": "uuid",
  "jobId": "uuid",
  "contentType": "recipe",
  "title": "...",
  "summary": "...",
  "confidenceScore": 0.85,
  "warnings": ["Some ingredient amounts could not be determined"],
  "missingInformation": ["Cooking temperature not mentioned"],
  "structuredOutput": {
    "contentType": "recipe",
    "ingredients": [...],
    "shoppingList": [...],
    "steps": [...]
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Errors**:
- `404` — Result not found

---

## POST /api/export/:resultId

Export a result in the requested format.

**Request**:
```json
{
  "format": "text" | "json"
}
```

**Response 200**: Text or JSON content with appropriate Content-Type header and Content-Disposition for download.

**Errors**:
- `400` — Invalid format
- `404` — Result not found

---

## GET /api/health

Health check endpoint.

**Response 200**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```
