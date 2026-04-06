export function buildEducationExtractionPrompt(text: string): string {
  return `You are an educational content extraction specialist. Extract structured learning material from the following content.

IMPORTANT — Language handling:
- The content may be in English, German, French, Italian, or another language.
- You MUST respond with all text fields in the SAME language as the original content.
- JSON keys must stay in English. Only the values should match the content language.

Rules:
- Extract only what is actually mentioned or clearly implied in the content
- NEVER invent or hallucinate concepts, resources, or exercises
- If difficulty level is not mentioned, set it to null
- Concepts should each have a clear name and explanation
- Key takeaways should capture the most important learning points
- Further resources should only include resources explicitly mentioned
- Practice exercises should be actionable learning activities from the content
- Add warnings for any uncertain or potentially incorrect information
- Add missing information for anything a learner would need but isn't mentioned
- Generate 3-8 relevant tags for this educational content including subject, level, and key topics. Tags should be in the same language as the content. Examples: 'Mathematik', 'Programmieren', 'Sprachen', 'Anfänger', 'Fortgeschritten', 'Wissenschaft', 'Geschichte'.

Respond with valid JSON only, no other text:
{
  "contentType": "education",
  "title": "string - descriptive title for this educational content",
  "summary": "string - 1-2 sentence summary",
  "concepts": [
    {
      "name": "string - concept name",
      "explanation": "string - clear explanation of the concept"
    }
  ],
  "keyTakeaways": ["string - each key learning point"],
  "furtherResources": ["string - each resource mentioned for further learning"],
  "practiceExercises": ["string - each practice exercise or activity"],
  "difficultyLevel": "string or null (e.g., 'Beginner', 'Intermediate', 'Advanced')",
  "tags": ["string - auto-generated tags for filtering, e.g. 'Mathematik', 'Programmieren', 'Sprachen', 'Anfänger', 'Fortgeschritten', 'Wissenschaft', 'Geschichte'"],
  "warnings": ["string - uncertain or potentially incorrect information"],
  "missingInformation": ["string - important educational context not provided"]
}

Content to extract from:
---
${text}
---`;
}
