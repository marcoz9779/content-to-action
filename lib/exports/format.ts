import type { StructuredOutput, ResultResponse } from "@/types";

export function formatResultAsText(result: ResultResponse): string {
  const lines: string[] = [];

  lines.push(`# ${result.title}`);
  lines.push(`Type: ${result.contentType}`);
  lines.push(`Confidence: ${Math.round(result.confidenceScore * 100)}%`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push(result.summary);
  lines.push("");

  const output = result.structuredOutput;
  lines.push(...formatStructuredOutputAsText(output));

  if (result.warnings.length > 0) {
    lines.push("");
    lines.push("## Warnings");
    result.warnings.forEach((w) => lines.push(`- ${w}`));
  }

  if (result.missingInformation.length > 0) {
    lines.push("");
    lines.push("## Missing Information");
    result.missingInformation.forEach((m) => lines.push(`- ${m}`));
  }

  return lines.join("\n");
}

function formatStructuredOutputAsText(output: StructuredOutput): string[] {
  const lines: string[] = [];

  switch (output.contentType) {
    case "recipe": {
      lines.push("## Ingredients");
      output.ingredients.forEach((i) => {
        const amount = i.amount ? `${i.amount} ` : "";
        const unit = i.unit ? `${i.unit} ` : "";
        const notes = i.notes ? ` (${i.notes})` : "";
        lines.push(`- ${amount}${unit}${i.name}${notes}`);
      });
      lines.push("");
      lines.push("## Shopping List");
      output.shoppingList.forEach((group) => {
        lines.push(`### ${group.category}`);
        group.items.forEach((item) => lines.push(`- ${item}`));
      });
      lines.push("");
      lines.push("## Steps");
      output.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
      if (output.prepTime) lines.push(`\nPrep time: ${output.prepTime}`);
      if (output.cookTime) lines.push(`Cook time: ${output.cookTime}`);
      if (output.servings) lines.push(`Servings: ${output.servings}`);
      break;
    }
    case "business": {
      lines.push("## Key Learnings");
      output.keyLearnings.forEach((l) => lines.push(`- ${l}`));
      lines.push("");
      lines.push("## Action Items");
      output.actionItems.forEach((a) => lines.push(`- [ ] ${a}`));
      if (output.frameworks.length > 0) {
        lines.push("");
        lines.push("## Frameworks");
        output.frameworks.forEach((f) => lines.push(`- ${f}`));
      }
      if (output.toolsMentioned.length > 0) {
        lines.push("");
        lines.push("## Tools Mentioned");
        output.toolsMentioned.forEach((t) => lines.push(`- ${t}`));
      }
      break;
    }
    case "diy": {
      lines.push("## Materials");
      output.materials.forEach((m) => lines.push(`- ${m}`));
      lines.push("");
      lines.push("## Tools");
      output.tools.forEach((t) => lines.push(`- ${t}`));
      lines.push("");
      lines.push("## Steps");
      output.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
      if (output.estimatedEffort)
        lines.push(`\nEstimated effort: ${output.estimatedEffort}`);
      if (output.difficultyLevel)
        lines.push(`Difficulty: ${output.difficultyLevel}`);
      break;
    }
    case "workout": {
      lines.push("## Exercises");
      output.exercises.forEach((e) => {
        let detail = e.name;
        const parts: string[] = [];
        if (e.sets) parts.push(`${e.sets} sets`);
        if (e.reps) parts.push(`${e.reps} reps`);
        if (e.duration) parts.push(e.duration);
        if (parts.length > 0) detail += ` — ${parts.join(", ")}`;
        if (e.notes) detail += ` (${e.notes})`;
        lines.push(`- ${detail}`);
      });
      if (output.workoutStructure) {
        lines.push(`\nStructure: ${output.workoutStructure}`);
      }
      if (output.totalDuration) {
        lines.push(`Duration: ${output.totalDuration}`);
      }
      if (output.targetMuscleGroups.length > 0) {
        lines.push(
          `Target muscles: ${output.targetMuscleGroups.join(", ")}`
        );
      }
      break;
    }
    case "other": {
      lines.push("## Key Points");
      output.keyPoints.forEach((p) => lines.push(`- ${p}`));
      lines.push("");
      lines.push("## Suggested Actions");
      output.suggestedActions.forEach((a) => lines.push(`- [ ] ${a}`));
      break;
    }
  }

  return lines;
}

export function formatResultAsJson(result: ResultResponse): string {
  return JSON.stringify(result, null, 2);
}
