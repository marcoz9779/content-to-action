export function buildFashionExtractionPrompt(text: string): string {
  return `You are a fashion content extraction specialist. Extract structured fashion and styling information from the following content.

IMPORTANT — Language handling:
- The content may be in English, German, French, Italian, or another language.
- You MUST respond with all text fields in the SAME language as the original content.
- JSON keys must stay in English. Only the values should match the content language.

Rules:
- Extract only what is actually mentioned or clearly implied in the content
- NEVER invent or hallucinate outfit items, brands, or prices
- If a brand is not mentioned for an item, set brand to null
- If a price is not mentioned for an item, set estimatedPrice to null
- Category should describe the type of garment or accessory (e.g., 'top', 'bottom', 'shoes', 'accessory')
- Style notes should capture styling advice and fashion tips
- Occasions should list events or situations the outfit is suitable for
- Alternative suggestions should offer comparable substitutions mentioned in the content
- Add warnings for any uncertain or potentially incorrect information
- Add missing information for anything a reader would need but isn't mentioned
- Generate 3-8 relevant tags for this fashion content including style, season, and key themes. Tags should be in the same language as the content. Examples: 'Casual', 'Elegant', 'Sommer', 'Winter', 'Streetwear', 'Vintage', 'Accessoires'.

Respond with valid JSON only, no other text:
{
  "contentType": "fashion",
  "title": "string - descriptive title for this fashion content",
  "summary": "string - 1-2 sentence summary",
  "outfitItems": [
    {
      "name": "string - item name or description",
      "brand": "string or null",
      "estimatedPrice": "string or null (e.g., '$49.99')",
      "category": "string (e.g., 'top', 'bottom', 'shoes', 'accessory')"
    }
  ],
  "styleNotes": ["string - each styling tip or note"],
  "occasions": ["string - each occasion or event suitable for"],
  "alternativeSuggestions": ["string - each alternative or substitution"],
  "tags": ["string - auto-generated tags for filtering, e.g. 'Casual', 'Elegant', 'Sommer', 'Winter', 'Streetwear', 'Vintage', 'Accessoires'"],
  "warnings": ["string - uncertain or potentially incorrect information"],
  "missingInformation": ["string - important fashion details not provided"]
}

Content to extract from:
---
${text}
---`;
}
