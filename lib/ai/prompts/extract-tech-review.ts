export function buildTechReviewExtractionPrompt(text: string): string {
  return `You are a technology review extraction specialist. Extract structured tech review information from the following content.

IMPORTANT — Language handling:
- The content may be in English, German, French, Italian, or another language.
- You MUST respond with all text fields in the SAME language as the original content.
- JSON keys must stay in English. Only the values should match the content language.

Rules:
- Extract only what is actually mentioned or clearly implied in the content
- NEVER invent or hallucinate specifications, ratings, or features
- If a rating is not mentioned, set it to null
- Product name should be the exact name of the product being reviewed
- Pros and cons should be clearly separated based on the content
- Specifications should list technical details mentioned
- Verdict should summarize the reviewer's final opinion
- Alternatives should list competing products mentioned in the content
- Add warnings for any uncertain or potentially incorrect information
- Add missing information for anything a buyer would need but isn't mentioned
- Generate 3-8 relevant tags for this tech review including product category, brand, and key features. Tags should be in the same language as the content. Examples: 'Smartphone', 'Laptop', 'Audio', 'Gaming', 'Apple', 'Samsung', 'Budget', 'Premium'.

Respond with valid JSON only, no other text:
{
  "contentType": "tech_review",
  "title": "string - descriptive title for this review",
  "summary": "string - 1-2 sentence summary",
  "productName": "string - exact product name",
  "prosAndCons": {
    "pros": ["string - each advantage or positive point"],
    "cons": ["string - each disadvantage or negative point"]
  },
  "rating": "string or null (e.g., '8/10', '4.5 stars')",
  "specifications": ["string - each technical specification mentioned"],
  "verdict": "string - final verdict or recommendation",
  "alternatives": ["string - each competing product mentioned"],
  "tags": ["string - auto-generated tags for filtering, e.g. 'Smartphone', 'Laptop', 'Audio', 'Gaming', 'Apple', 'Samsung', 'Budget', 'Premium'"],
  "warnings": ["string - uncertain or potentially incorrect information"],
  "missingInformation": ["string - important tech details not provided"]
}

Content to extract from:
---
${text}
---`;
}
