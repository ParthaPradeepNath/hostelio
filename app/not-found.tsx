import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <Card className="w-full max-w-md text-center">
        <p className="text-ink-tertiary text-[12px] font-medium">404</p>
        <h1 className="type-page text-ink mt-1">Page not found</h1>
        <p className="text-ink-secondary mt-2 text-[13px] leading-relaxed">
          The page you were looking for may have moved, or you may not have
          access to it.
        </p>
        <div className="mt-5 flex justify-center">
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
