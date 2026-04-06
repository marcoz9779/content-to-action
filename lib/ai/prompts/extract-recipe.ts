export function buildRecipeExtractionPrompt(text: string): string {
  const currentMonth = new Date().toLocaleString("de-DE", { month: "long" });

  return `You are a world-class recipe extraction specialist. Extract a detailed, structured recipe from the following content.

IMPORTANT — Language handling:
- The content may be in English, German, French, Italian, or another language.
- You MUST respond with all text fields in the SAME language as the original content.
- JSON keys must stay in English. Only the values should match the content language.

Rules:
- Extract only what is actually mentioned or clearly implied in the content
- NEVER invent or hallucinate ingredients, amounts, or steps
- If an ingredient amount is not mentioned, set amount and unit to null
- If prep time, cook time, or servings are not mentioned, set them to null
- Group shopping list items by grocery category (produce, dairy, protein, pantry, spices, etc.)
- Steps should be clear, actionable, and in order
- Add warnings for any uncertain or potentially incorrect information
- Add missing information for anything a cook would need but isn't mentioned
- Generate 3-8 relevant tags for this recipe including main ingredients, cuisine type, meal type, and dietary info
- Determine the difficulty level: "Einfach", "Mittel", or "Fortgeschritten"
- Determine the cuisine type (e.g., "Italienisch", "Asiatisch", "Schweizerisch", "Mexikanisch")
- Determine the meal category (e.g., "Hauptgericht", "Vorspeise", "Dessert", "Snack", "Frühstück")
- For each ingredient, determine if it is currently in season (current month: ${currentMonth}). Set seasonal to true/false
- Calculate an approximate cost level: "Günstig" (< 10 CHF), "Mittel" (10-25 CHF), "Gehoben" (> 25 CHF)
- If the recipe has notable nutritional highlights, mention them in nutritionHighlights

Respond with valid JSON only, no other text:
{
  "contentType": "recipe",
  "title": "string - descriptive recipe title",
  "summary": "string - 1-2 sentence summary of the dish",
  "cuisine": "string - cuisine type (e.g., 'Italienisch', 'Asiatisch')",
  "mealCategory": "string - meal type (e.g., 'Hauptgericht', 'Dessert')",
  "difficulty": "string - 'Einfach', 'Mittel', or 'Fortgeschritten'",
  "costLevel": "string - 'Günstig', 'Mittel', or 'Gehoben'",
  "ingredients": [
    {
      "name": "string",
      "amount": "string or null",
      "unit": "string or null",
      "notes": "string or null (e.g., 'gewürfelt', 'Zimmertemperatur')",
      "seasonal": true or false
    }
  ],
  "shoppingList": [
    {
      "category": "string (e.g., 'Gemüse & Obst', 'Milchprodukte', 'Fleisch & Fisch')",
      "items": ["string"]
    }
  ],
  "steps": ["string - each step as a clear instruction"],
  "prepTime": "string or null (e.g., '15 Minuten')",
  "cookTime": "string or null (e.g., '30 Minuten')",
  "servings": "string or null (e.g., '4 Portionen')",
  "nutritionHighlights": ["string - notable nutritional facts, e.g. 'Reich an Protein', 'Wenig Kalorien'"],
  "seasonalIngredients": ["string - list of ingredients that are currently in season"],
  "tags": ["string - auto-generated tags for filtering"],
  "warnings": ["string - any uncertain or potentially incorrect information"],
  "missingInformation": ["string - anything a cook would need but isn't mentioned"]
}

Content to extract from:
---
${text}
---`;
}
