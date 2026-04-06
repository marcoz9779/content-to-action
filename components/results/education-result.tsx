"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Lightbulb, BookOpen, Dumbbell, Gauge } from "lucide-react";
import type { EducationOutput } from "@/types";

interface EducationResultProps {
  output: EducationOutput;
}

export function EducationResult({ output }: EducationResultProps) {

  return (
    <div className="space-y-6">
      {output.difficultyLevel && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Gauge className="h-4 w-4" /> Difficulty: {output.difficultyLevel}
          </span>
        </div>
      )}

      {output.concepts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" />
              Concepts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {output.concepts.map((concept, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{concept.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{concept.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {output.keyTakeaways.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4" />
              Key Takeaways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {output.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {takeaway}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {output.practiceExercises.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell className="h-4 w-4" />
              Practice Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {output.practiceExercises.map((exercise, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{exercise}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {output.furtherResources.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Further Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {output.furtherResources.map((resource, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {resource}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
