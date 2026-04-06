"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, MapPin, DollarSign, Calendar, Luggage } from "lucide-react";
import type { TravelOutput } from "@/types";

interface TravelResultProps {
  output: TravelOutput;
}

export function TravelResult({ output }: TravelResultProps) {

  return (
    <div className="space-y-6">
      {(output.estimatedBudget || output.bestTimeToVisit) && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {output.estimatedBudget && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> Budget: {output.estimatedBudget}
            </span>
          )}
          {output.bestTimeToVisit && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Best Time: {output.bestTimeToVisit}
            </span>
          )}
        </div>
      )}

      {output.destinations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {output.destinations.map((destination, index) => (
                <span key={index} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">
                  {destination}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {output.travelTips.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Plane className="h-4 w-4" />
              Travel Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {output.travelTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {output.packingList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Luggage className="h-4 w-4" />
              Packing List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {output.packingList.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="h-4 w-4 shrink-0 rounded border" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
