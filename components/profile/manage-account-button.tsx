"use client";

import { UserRoundCog } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function ManageAccountButton() {
  const { openUserProfile } = useClerk();

  return (
    <Button variant="secondary" size="sm" onClick={() => openUserProfile()}>
      <UserRoundCog aria-hidden />
      Manage account
    </Button>
  );
}
