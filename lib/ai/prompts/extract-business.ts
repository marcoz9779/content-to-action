export function buildBusinessExtractionPrompt(text: string): string {
  return `You are a business content extraction specialist. Extract structured business insights from the following content.

IMPORTANT — Language handling:
- The content may be in English, German, French, Italian, or another language.
- You MUST respond with all text fields (title, summary, learnings, action items, warnings, etc.) in the SAME language as the original content.
- JSON keys must stay in English. Only the values should match the content language.

Rules:
- Extract only what is actually mentioned or clearly implied
- NEVER invent frameworks, tools, or action items not present in the content
- Key learnings should be concise, actionable takeaways
- Action items should be specific things someone could do after watching
- Only list frameworks if they are explicitly named or clearly described
- Only list tools if they are explicitly mentioned by name
- Add warnings for any uncertain or potentially incorrect information
- Add missing information for context that would be helpful but isn't provided
- Generate 3-8 relevant tags for this content including industry, topic, and key themes. Tags should be in the same language as the content. Examples: 'Marketing', 'Startups', 'Finanzen', 'E-Commerce', 'Produktivität', 'Führung'.

Respond with valid JSON only, no other text:
{
  "contentType": "business",
  "title": "string - descriptive title for this business content",
  "summary": "string - 1-2 sentence summary of the core message",
  "keyLearnings": ["string - each key learning as a concise statement"],
  "actionItems": ["string - each action item as a specific, doable task"],
  "frameworks": ["string - named frameworks or methodologies mentioned"],
  "toolsMentioned": ["string - specific tools, apps, or services mentioned"],
  "tags": ["string - auto-generated tags for filtering, e.g. 'Marketing', 'Startups', 'Finanzen', 'E-Commerce', 'Produktivität', 'Führung'"],
  "warnings": ["string - any uncertain or potentially incorrect information"],
  "missingInformation": ["string - context that would help but isn't provided"]
}

Content to extract from:
---
${text}
---`;
}
