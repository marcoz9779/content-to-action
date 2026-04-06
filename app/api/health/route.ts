import { NextResponse } from "next/server";
import type { HealthResponse } from "@/types";

export async function GET() {
  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response);
}
