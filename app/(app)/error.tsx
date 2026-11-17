"use client";

import { useEffect } from "react";

import Link from "next/link";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <h2 className="type-section text-ink">Something went wrong</h2>
        <p className="text-ink-secondary mt-2 text-[13px] leading-relaxed">
          We could not load this page. Try again, or return to the dashboard if
          the problem continues.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset}>
            <RotateCcw aria-hidden />
            Try again
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
