"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/shared/page-transition";
import { useAuth } from "@/lib/supabase/auth";
import { useTranslation } from "@/lib/i18n";
import { Loader2, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function VerifyPage() {
  const { t } = useTranslation();
  const { verifyOtp, resendOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];

    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      digits.forEach((d, i) => {
        if (i + index < 6) newCode[i + index] = d;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    const token = code.join("");
    if (token.length !== 6) {
      toast.error("Bitte gib den 6-stelligen Code ein");
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(email, token);
    if (error) {
      toast.error(error);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      toast.success("E-Mail bestätigt!");
      router.push("/app/new");
    }
    setLoading(false);
  }

  async function handleResend() {
    setResending(true);
    const { error } = await resendOtp(email);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Neuer Code gesendet");
    }
    setResending(false);
  }

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (code.every((d) => d !== "") && code.join("").length === 6) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <PageTransition className="container flex min-h-[60vh] max-w-md items-center justify-center py-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t.auth.verifyTitle ?? "Code eingeben"}</CardTitle>
          <CardDescription>
            {t.auth.verifyDesc ?? "Wir haben dir einen 6-stelligen Code gesendet an:"}
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                className="h-14 w-11 rounded-lg border-2 border-input bg-background text-center text-xl font-bold transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={loading || code.join("").length !== 6}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {t.auth.verifyButton ?? "Bestätigen"}
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={resending}
              className="text-xs text-muted-foreground"
            >
              {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
              {t.auth.resendCode ?? "Code erneut senden"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
