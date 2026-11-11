"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest, errorMessage } from "@/lib/client/api";

export function MaintenanceButton({
  roomId,
  roomNumber,
  status,
  occupied,
}: {
  roomId: string;
  roomNumber: string;
  status: "AVAILABLE" | "FULL" | "MAINTENANCE";
  occupied: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const underMaintenance = status === "MAINTENANCE";
  const blocked = !underMaintenance && occupied > 0;

  async function toggle() {
    setPending(true);
    try {
      await apiRequest(`/api/rooms/${roomId}`, {
        method: "PUT",
        body: JSON.stringify({ status: underMaintenance ? "AVAILABLE" : "MAINTENANCE" }),
      });
      toast.success(
        underMaintenance ? `${roomNumber} is back in service` : `${roomNumber} is under maintenance`,
      );
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  const button = (
    <Button variant="secondary" size="sm" onClick={toggle} disabled={pending || blocked}>
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Wrench aria-hidden />}
      {underMaintenance ? "Return to service" : "Put under maintenance"}
    </Button>
  );

  if (!blocked) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex rounded-md">
          {button}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Move the {occupied === 1 ? "occupant" : "occupants"} out before putting this room under
        maintenance.
      </TooltipContent>
    </Tooltip>
  );
}
