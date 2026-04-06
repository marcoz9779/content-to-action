export function buildDIYExtractionPrompt(text: string): string {
  return `You are a DIY project extraction specialist. Extract a structured project guide from the following content.

IMPORTANT — Language handling:
- The content may be in English, German, French, Italian, or another language.
- You MUST respond with all text fields (title, summary, materials, steps, warnings, etc.) in the SAME language as the original content.
- JSON keys must stay in English. Only the values should match the content language.

Rules:
- Extract only what is actually mentioned or clearly implied
- NEVER invent materials, tools, or steps not present in the content
- Materials should be specific items needed for the project
- Tools should be specific instruments or equipment mentioned
- Steps should be clear, actionable, and in the correct order
- Estimated effort should be based on what is mentioned or reasonably inferred
- Difficulty level should be inferred from complexity of steps and tools required
- Add warnings for any uncertain, safety-related, or potentially incorrect information
- Add missing information for anything a builder would need but isn't mentioned
- Generate 3-8 relevant tags for this project including project type, materials, and difficulty. Tags should be in the same language as the content. Examples: 'Holz', 'Garten', 'Dekoration', 'Möbel', 'Upcycling', 'Anfänger'.

Respond with valid JSON only, no other text:
{
  "contentType": "diy",
  "title": "string - descriptive project title",
  "summary": "string - 1-2 sentence summary of the project",
  "materials": ["string - each material needed"],
  "tools": ["string - each tool needed"],
  "steps": ["string - each step as a clear instruction"],
  "estimatedEffort": "string or null (e.g., '2-3 hours', 'one weekend')",
  "difficultyLevel": "string or null (e.g., 'beginner', 'intermediate', 'advanced')",
  "tags": ["string - auto-generated tags for filtering, e.g. 'Holz', 'Garten', 'Dekoration', 'Möbel', 'Upcycling', 'Anfänger'"],
  "warnings": ["string - safety warnings or uncertain information"],
  "missingInformation": ["string - anything needed but not mentioned"]
}

Content to extract from:
---
${text}
---`;
}
