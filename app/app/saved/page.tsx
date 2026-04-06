"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SavedPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/app/history"); }, [router]);
  return null;
}
