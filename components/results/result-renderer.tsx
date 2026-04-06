import type { StructuredOutput } from "@/types";
import { RecipeResult } from "./recipe-result";
import { BusinessResult } from "./business-result";
import { DIYResult } from "./diy-result";
import { WorkoutResult } from "./workout-result";
import { TravelResult } from "./travel-result";
import { FashionResult } from "./fashion-result";
import { TechReviewResult } from "./tech-review-result";
import { EducationResult } from "./education-result";
import { OtherResult } from "./other-result";

interface ResultRendererProps {
  output: StructuredOutput;
  thumbnailUrl?: string | null;
  sourceCreator?: string | null;
  sourceUrl?: string | null;
  resultId?: string;
}

export function ResultRenderer({ output, thumbnailUrl, sourceCreator, sourceUrl, resultId }: ResultRendererProps) {
  switch (output.contentType) {
    case "recipe":
      return <RecipeResult output={output} thumbnailUrl={thumbnailUrl} sourceCreator={sourceCreator} sourceUrl={sourceUrl} resultId={resultId} />;
    case "business":
      return <BusinessResult output={output} />;
    case "diy":
      return <DIYResult output={output} />;
    case "workout":
      return <WorkoutResult output={output} />;
    case "travel":
      return <TravelResult output={output} />;
    case "fashion":
      return <FashionResult output={output} />;
    case "tech_review":
      return <TechReviewResult output={output} />;
    case "education":
      return <EducationResult output={output} />;
    case "other":
      return <OtherResult output={output} />;
  }
}
