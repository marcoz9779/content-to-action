export function buildTravelExtractionPrompt(text: string): string {
  return `You are a travel content extraction specialist. Extract structured travel information from the following content.

IMPORTANT — Language handling:
- The content may be in English, German, French, Italian, or another language.
- You MUST respond with all text fields in the SAME language as the original content.
- JSON keys must stay in English. Only the values should match the content language.

Rules:
- Extract only what is actually mentioned or clearly implied in the content
- NEVER invent or hallucinate destinations, tips, or budget information
- If estimated budget is not mentioned, set it to null
- If best time to visit is not mentioned, set it to null
- Destinations should be specific place names mentioned in the content
- Travel tips should be practical and actionable
- Packing list should only include items explicitly mentioned or clearly implied
- Add warnings for any uncertain or potentially incorrect information
- Add missing information for anything a traveler would need but isn't mentioned
- Generate 3-8 relevant tags for this travel content including region, travel type, and key themes. Tags should be in the same language as the content. Examples: 'Europa', 'Strandurlaub', 'Backpacking', 'Städtereise', 'Budget', 'Luxus', 'Abenteuer'.

Respond with valid JSON only, no other text:
{
  "contentType": "travel",
  "title": "string - descriptive title for this travel content",
  "summary": "string - 1-2 sentence summary",
  "destinations": ["string - each destination mentioned"],
  "travelTips": ["string - each travel tip as practical advice"],
  "estimatedBudget": "string or null (e.g., '$2000 for 7 days')",
  "bestTimeToVisit": "string or null (e.g., 'March to May')",
  "packingList": ["string - each item to pack"],
  "tags": ["string - auto-generated tags for filtering, e.g. 'Europa', 'Strandurlaub', 'Backpacking', 'Städtereise', 'Budget', 'Luxus', 'Abenteuer'"],
  "warnings": ["string - uncertain or potentially incorrect information"],
  "missingInformation": ["string - important travel details not provided"]
}

Content to extract from:
---
${text}
---`;
}
