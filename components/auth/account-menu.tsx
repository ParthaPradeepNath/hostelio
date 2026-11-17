"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, errorMessage } from "@/lib/client/api";
import { initials } from "@/lib/utils";

type AccountMenuProps = {
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
};

export function AccountMenu({ name, email }: AccountMenuProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      setBusy(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Account menu"
          className="rounded-pill"
        >
          <span className="rounded-pill bg-accent-soft text-accent flex size-7 items-center justify-center text-[11px] font-semibold">
            {initials(name)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-ink truncate text-[13px] font-medium">
            {name}
          </span>
          <span className="text-ink-tertiary truncate text-[11px] font-normal">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound aria-hidden />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={busy}
          onSelect={(event) => {
            event.preventDefault();
            void signOut();
          }}
        >
          <LogOut aria-hidden />
          {busy ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
