"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, ThumbsUp, ThumbsDown, Star, List, Scale } from "lucide-react";
import type { TechReviewOutput } from "@/types";

interface TechReviewResultProps {
  output: TechReviewOutput;
}

export function TechReviewResult({ output }: TechReviewResultProps) {

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Cpu className="h-4 w-4" /> {output.productName}
        </span>
        {output.rating && (
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" /> {output.rating}
          </span>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ThumbsUp className="h-4 w-4" />
            Pros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {output.prosAndCons.pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                {pro}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ThumbsDown className="h-4 w-4" />
            Cons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {output.prosAndCons.cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {con}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {output.specifications.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <List className="h-4 w-4" />
              Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {output.specifications.map((spec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {spec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4" />
            Verdict
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{output.verdict}</p>
        </CardContent>
      </Card>

      {output.alternatives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Alternatives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {output.alternatives.map((alt, index) => (
                <span key={index} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">
                  {alt}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
