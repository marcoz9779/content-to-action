export function buildOtherExtractionPrompt(text: string): string {
  return `You are a content extraction specialist. Extract structured key points and actionable insights from the following content.

IMPORTANT — Language handling:
- The content may be in English, German, French, Italian, or another language.
- You MUST respond with all text fields (title, summary, key points, actions, warnings, etc.) in the SAME language as the original content.
- JSON keys must stay in English. Only the values should match the content language.

Rules:
- Extract only what is actually mentioned or clearly implied
- NEVER invent points or actions not present in the content
- Key points should capture the most important information
- Suggested actions should be practical things someone could do based on the content
- Add warnings for any uncertain or potentially incorrect information
- Add missing information for important context that isn't provided
- Generate 3-8 relevant tags for this content including main topics and themes. Tags should be in the same language as the content.

Respond with valid JSON only, no other text:
{
  "contentType": "other",
  "title": "string - descriptive title for this content",
  "summary": "string - 1-2 sentence summary",
  "keyPoints": ["string - each key point as a clear statement"],
  "suggestedActions": ["string - each action as a practical, doable task"],
  "tags": ["string - auto-generated tags for filtering based on main topics and themes"],
  "warnings": ["string - uncertain or potentially incorrect information"],
  "missingInformation": ["string - important context not provided"]
}

Content to extract from:
---
${text}
---`;
}
