"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, errorMessage } from "@/lib/client/api";
import { cn } from "@/lib/utils";

const TRANSITIONS: Record<
  string,
  { status: string; label: string; destructive?: boolean }[]
> = {
  OPEN: [
    { status: "IN_PROGRESS", label: "Start work" },
    { status: "REJECTED", label: "Reject", destructive: true },
  ],
  IN_PROGRESS: [
    { status: "RESOLVED", label: "Mark resolved" },
    { status: "REJECTED", label: "Reject", destructive: true },
  ],
  RESOLVED: [{ status: "IN_PROGRESS", label: "Reopen" }],
  REJECTED: [],
};

export function QuickStatus({
  complaintId,
  status,
  title,
}: {
  complaintId: string;
  status: string;
  title: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCurrent(status);
  }, [status]);

  const options = TRANSITIONS[current] ?? [];

  async function update(next: string) {
    const previous = current;
    setCurrent(next);
    setPending(true);
    try {
      await apiRequest(`/api/complaints/${complaintId}`, {
        method: "PUT",
        body: JSON.stringify({ status: next }),
      });
      toast.success(`"${title}" updated`);
      router.refresh();
    } catch (error) {
      setCurrent(previous);
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  if (options.length === 0) {
    return <StatusBadge value={current} />;
  }

  return (
    <div className="flex items-center gap-1.5">
      <StatusBadge value={current} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-11 sm:size-7"
            aria-label={`Change status for ${title}`}
            disabled={pending}
          >
            {pending ? (
              <Loader2
                className="animate-spin motion-reduce:animate-none"
                aria-hidden
              />
            ) : (
              <ChevronDown aria-hidden />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Change status</DropdownMenuLabel>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.status}
              onSelect={() => update(option.status)}
              className={cn(
                option.destructive &&
                  "text-danger data-[highlighted]:bg-danger-soft"
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
