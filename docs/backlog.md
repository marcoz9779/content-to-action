# Backlog

## MVP Scope (v0.1)

- [x] Project scaffold and configuration
- [x] Database schema and migrations
- [x] Type system and Zod schemas
- [x] Upload API with file validation
- [x] Analyze API with job creation
- [x] Job processor with status tracking
- [x] AI pipeline: classify + extract (OpenAI)
- [x] Platform detection
- [x] Landing page
- [x] New analysis page (URL + upload)
- [x] Processing page with polling
- [x] Result page with type-specific rendering
- [x] Copy and export functionality
- [x] Error handling and fallback flows
- [x] Unit tests for critical logic
- [x] E2E smoke tests
- [x] CI pipeline
- [x] Documentation

## Post-MVP Features

### High Priority
- [ ] User authentication (Supabase Auth)
- [ ] Save results for authenticated users
- [ ] Result history page
- [ ] Real video transcription (Whisper API)
- [ ] Real OCR implementation
- [ ] Rate limiting middleware
- [ ] Better URL source resolution per platform

### Medium Priority
- [ ] Multi-language content support
- [ ] Browser extension for one-click capture
- [ ] Share result via link
- [ ] Dark mode
- [ ] Notification when processing complete
- [ ] Result comparison view
- [ ] Bulk analysis (multiple URLs)

### Lower Priority
- [ ] Webhook integrations (Notion, Todoist, Trello)
- [ ] Team workspaces
- [ ] API access for external tools
- [ ] Custom content type plugins
- [ ] Usage analytics dashboard
- [ ] Content type training/feedback loop

## Technical Debt

- [ ] Move job processing to queue worker (BullMQ, Inngest, or similar)
- [ ] Add proper caching layer (Redis)
- [ ] Implement retry logic for transient AI failures
- [ ] Add structured logging (Pino or Winston)
- [ ] Add request tracing
- [ ] Improve test coverage to >80%
- [ ] Performance monitoring and alerting

## Open Decisions

- **Queue system**: Which queue provider for production job processing? (Inngest, Trigger.dev, BullMQ)
- **OCR provider**: Which OCR service to use for on-screen text extraction? (Google Vision, AWS Textract, custom)
- **Caching**: Should we cache results for identical URLs? Privacy implications?
- **Auth timing**: When to introduce mandatory auth? What's the anonymous usage limit?
- **Monetization**: Free tier limits, paid features?

## Future Integrations

- Notion API (export directly to Notion page)
- Todoist API (create tasks from action items)
- Google Calendar (schedule workout sessions)
- Apple Reminders / Shopping list
- Slack (share results to channel)
- Zapier/Make (automation workflows)
