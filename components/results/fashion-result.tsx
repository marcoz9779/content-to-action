"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Sparkles, Tag, Repeat } from "lucide-react";
import type { FashionOutput } from "@/types";

interface FashionResultProps {
  output: FashionOutput;
}

export function FashionResult({ output }: FashionResultProps) {

  return (
    <div className="space-y-6">
      {output.occasions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {output.occasions.map((occasion, index) => (
            <span key={index} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">
              {occasion}
            </span>
          ))}
        </div>
      )}

      {output.outfitItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shirt className="h-4 w-4" />
              Outfit Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {output.outfitItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded bg-secondary px-1.5 py-0.5">{item.category}</span>
                      {item.brand && <span>Brand: {item.brand}</span>}
                      {item.estimatedPrice && <span>{item.estimatedPrice}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {output.styleNotes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" />
              Style Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {output.styleNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {output.alternativeSuggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Repeat className="h-4 w-4" />
              Alternative Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {output.alternativeSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
