export function buildWorkoutExtractionPrompt(text: string): string {
  return `You are a workout extraction specialist. Extract a structured workout routine from the following content.

IMPORTANT — Language handling:
- The content may be in English, German, French, Italian, or another language.
- You MUST respond with all text fields (title, summary, exercise names, notes, warnings, etc.) in the SAME language as the original content.
- JSON keys must stay in English. Only the values should match the content language.

Rules:
- Extract only exercises and details actually mentioned or clearly demonstrated
- NEVER invent exercises, reps, sets, or durations not present in the content
- If reps, sets, or duration are not specified for an exercise, set them to null
- Notes can include form cues, modifications, or other relevant details mentioned
- Workout structure should describe the overall format (circuit, AMRAP, intervals, etc.)
- Target muscle groups should be inferred from the exercises mentioned
- Add warnings for any uncertain information or potential safety concerns
- Add missing information for anything a person would need to complete the workout
- Generate 3-8 relevant tags for this workout including workout type, target area, and difficulty. Tags should be in the same language as the content. Examples: 'HIIT', 'Kraft', 'Dehnung', 'Anfänger', 'Oberkörper', 'Cardio', 'Yoga'.

Respond with valid JSON only, no other text:
{
  "contentType": "workout",
  "title": "string - descriptive workout title",
  "summary": "string - 1-2 sentence summary of the workout",
  "exercises": [
    {
      "name": "string - exercise name",
      "reps": "string or null (e.g., '12', '8-10')",
      "sets": "string or null (e.g., '3', '4')",
      "duration": "string or null (e.g., '30 seconds', '1 minute')",
      "notes": "string or null (form cues, modifications)"
    }
  ],
  "workoutStructure": "string or null (e.g., '3 rounds circuit', 'AMRAP 20 min')",
  "totalDuration": "string or null (e.g., '30 minutes')",
  "targetMuscleGroups": ["string - muscle groups targeted"],
  "tags": ["string - auto-generated tags for filtering, e.g. 'HIIT', 'Kraft', 'Dehnung', 'Anfänger', 'Oberkörper', 'Cardio', 'Yoga'"],
  "warnings": ["string - safety concerns or uncertain information"],
  "missingInformation": ["string - anything needed but not mentioned"]
}

Content to extract from:
---
${text}
---`;
}
