"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DoorOpen, Loader2, MoreHorizontal, MoveRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/allocations/confirm-dialog";
import { MoveRoomDialog, type AllocatableRoom } from "@/components/allocations/move-room-dialog";
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

export function VacateAllocationButton({
  allocationId,
  studentName,
  trigger,
}: {
  allocationId: string;
  studentName: string;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="contents">
          {trigger}
        </span>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <DoorOpen aria-hidden />
          Vacate
        </Button>
      )}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Vacate ${studentName}?`}
        description="The allocation is marked vacated today and the bed becomes available. Allocation history is kept."
        confirmLabel="Vacate bed"
        destructive
        onConfirm={vacate}
      />
    </>
  );
}

export function DeleteAllocationButton({
  allocationId,
  studentName,
  trigger,
}: {
  allocationId: string;
  studentName: string;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function remove() {
    try {
      await apiRequest(`/api/allocations/${allocationId}`, { method: "DELETE" });
      toast.success("Allocation record deleted");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    }
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="contents">
          {trigger}
        </span>
      ) : (
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
          <Trash2 aria-hidden />
          Delete
        </Button>
      )}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${studentName}'s allocation record?`}
        description="This permanently removes the allocation from the database. Prefer vacating so the history stays intact."
        confirmLabel="Delete record"
        destructive
        onConfirm={remove}
      />
    </>
  );
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

  if (compact) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Button variant="ghost" size="sm" onClick={() => setMoveOpen(true)}>
          <MoveRight aria-hidden />
          Move
        </Button>
        <VacateAllocationButton
          allocationId={allocationId}
          studentName={studentName}
          trigger={
            <Button variant="ghost" size="sm">
              <DoorOpen aria-hidden />
              Vacate
            </Button>
          }
        />
        <MoveRoomDialog
          allocationId={allocationId}
          studentName={studentName}
          rooms={rooms}
          excludeRoomId={roomId}
          open={moveOpen}
          onOpenChange={setMoveOpen}
        />
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
          <VacateAllocationButton
            allocationId={allocationId}
            studentName={studentName}
            trigger={
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <DoorOpen aria-hidden />
                Vacate
              </DropdownMenuItem>
            }
          />
          <DropdownMenuSeparator />
          <DeleteAllocationButton
            allocationId={allocationId}
            studentName={studentName}
            trigger={
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
                className="text-danger data-[highlighted]:bg-danger-soft"
              >
                <Trash2 aria-hidden />
                Delete record
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <MoveRoomDialog
        allocationId={allocationId}
        studentName={studentName}
        rooms={rooms}
        excludeRoomId={roomId}
        open={moveOpen}
        onOpenChange={setMoveOpen}
      />
    </>
  );
}

export function AllocationPending() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-tertiary">
      <Loader2 className="size-3 animate-spin" aria-hidden />
      Saving
    </span>
  );
}
