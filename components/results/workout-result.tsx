"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Clock, Target } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { WorkoutOutput } from "@/types";

interface WorkoutResultProps {
  output: WorkoutOutput;
}

export function WorkoutResult({ output }: WorkoutResultProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {output.totalDuration && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {output.totalDuration}
          </span>
        )}
        {output.workoutStructure && (
          <span className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" /> {output.workoutStructure}
          </span>
        )}
      </div>

      {output.targetMuscleGroups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          {output.targetMuscleGroups.map((group, index) => (
            <span key={index} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">
              {group}
            </span>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="h-4 w-4" />
            {t.workoutResult.exercises}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {output.exercises.map((exercise, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{exercise.name}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {exercise.sets && <span>{exercise.sets} {t.workoutResult.sets}</span>}
                    {exercise.reps && <span>{exercise.reps} {t.workoutResult.reps}</span>}
                    {exercise.duration && <span>{exercise.duration}</span>}
                  </div>
                  {exercise.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">{exercise.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
