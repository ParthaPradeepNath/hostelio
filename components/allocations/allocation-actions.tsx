"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { DoorOpen, MoreHorizontal, MoveRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/allocations/confirm-dialog";
import {
  type AllocatableRoom,
  MoveRoomDialog,
} from "@/components/allocations/move-room-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, errorMessage } from "@/lib/client/api";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function useAllocationActions(allocationId: string, studentName: string) {
  const router = useRouter();

  async function vacate() {
    try {
      await apiRequest(`/api/allocations/${allocationId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "VACATED", endDate: todayInputValue() }),
      });
      toast.success(`${studentName} vacated`);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    }
  }

  async function remove() {
    try {
      await apiRequest(`/api/allocations/${allocationId}`, {
        method: "DELETE",
      });
      toast.success("Allocation record deleted");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    }
  }

  return { vacate, remove };
}

export function AllocationRowActions({
  allocationId,
  studentName,
  roomId,
  rooms,
  compact = false,
}: {
  allocationId: string;
  studentName: string;
  roomId: string;
  rooms: AllocatableRoom[];
  compact?: boolean;
}) {
  const [moveOpen, setMoveOpen] = useState(false);
  const [vacateOpen, setVacateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { vacate, remove } = useAllocationActions(allocationId, studentName);

  const moveDialog = (
    <MoveRoomDialog
      allocationId={allocationId}
      studentName={studentName}
      rooms={rooms}
      excludeRoomId={roomId}
      open={moveOpen}
      onOpenChange={setMoveOpen}
    />
  );

  const confirmDialogs = (
    <>
      <ConfirmDialog
        open={vacateOpen}
        onOpenChange={setVacateOpen}
        title={`Vacate ${studentName}?`}
        description="The allocation is marked vacated today and the bed becomes available. Allocation history is kept."
        confirmLabel="Vacate bed"
        destructive
        onConfirm={vacate}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${studentName}'s allocation record?`}
        description="This permanently removes the allocation from the database. Prefer vacating so the history stays intact."
        confirmLabel="Delete record"
        destructive
        onConfirm={remove}
      />
    </>
  );

  if (compact) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setMoveOpen(true)}>
          <MoveRight aria-hidden />
          Move
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setVacateOpen(true)}>
          <DoorOpen aria-hidden />
          Vacate
        </Button>
        {moveDialog}
        {confirmDialogs}
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${studentName}`}
          >
            <MoreHorizontal aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setMoveOpen(true)}>
            <MoveRight aria-hidden />
            Move room
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setVacateOpen(true)}>
            <DoorOpen aria-hidden />
            Vacate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="text-danger data-[highlighted]:bg-danger-soft"
          >
            <Trash2 aria-hidden />
            Delete record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {moveDialog}
      {confirmDialogs}
    </>
  );
}
