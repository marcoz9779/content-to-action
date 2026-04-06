export function buildClassificationPrompt(text: string): string {
  return `You are a content classifier. Your job is to determine the type of content based on the provided text.

The text may be in any language (English, German, French, Italian, or others). Classify based on the meaning, regardless of language.

Analyze the following text and classify it into exactly one of these categories:
- recipe: Cooking or food preparation content
- business: Business advice, entrepreneurship, marketing, productivity tips
- diy: Do-it-yourself projects, crafts, home improvement
- workout: Exercise, fitness routines, physical training
- travel: Travel advice, destination guides, trip planning
- fashion: Fashion tips, outfit ideas, styling advice
- tech_review: Technology reviews, product comparisons, gadget analysis
- education: Educational content, tutorials, learning material
- other: Anything that doesn't clearly fit the above categories

Rules:
- Choose the single best-fitting category
- If the content could fit multiple categories, choose the primary one
- Provide a confidence score between 0 and 1
- Use 0.8+ for clear matches, 0.5-0.8 for reasonable matches, below 0.5 for uncertain matches

Respond with valid JSON only, no other text:
{
  "contentType": "recipe" | "business" | "diy" | "workout" | "travel" | "fashion" | "tech_review" | "education" | "other",
  "confidence": number
}

Text to classify:
---
${text}
---`;
}
