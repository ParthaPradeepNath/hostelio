"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoveRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, errorMessage } from "@/lib/client/api";
import { pluralize } from "@/lib/utils";

export type AllocatableRoom = {
  id: string;
  roomNumber: string;
  block: string;
  floor: number;
  capacity: number;
  occupancy: number;
  availableBeds: number;
};

export function MoveRoomDialog({
  allocationId,
  studentName,
  rooms,
  excludeRoomId,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  allocationId: string;
  studentName: string;
  rooms: AllocatableRoom[];
  excludeRoomId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;
  const [roomId, setRoomId] = useState("");
  const [pending, setPending] = useState(false);

  const options = rooms.filter((room) => room.id !== excludeRoomId);

  async function submit() {
    if (!roomId) {
      toast.error("Choose a room to move to");
      return;
    }
    setPending(true);
    try {
      await apiRequest(`/api/allocations/${allocationId}`, {
        method: "PUT",
        body: JSON.stringify({ roomId }),
      });
      toast.success(`${studentName} moved`);
      onOpenChange(false);
      setRoomId("");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <>{trigger}</> : null}
      <DialogContent aria-describedby="move-description">
        <DialogHeader>
          <DialogTitle>Move {studentName}</DialogTitle>
          <DialogDescription id="move-description">
            The current allocation is vacated and a new active allocation is created in the target room.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5">
          <Field label="Target room" htmlFor="targetRoom">
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger id="targetRoom">
                <SelectValue placeholder="Choose a room with space" />
              </SelectTrigger>
              <SelectContent>
                {options.length === 0 ? (
                  <div className="px-2 py-3 text-[12px] text-ink-tertiary">No rooms have available beds.</div>
                ) : (
                  options.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.roomNumber} · Block {room.block} · Floor {room.floor} ·{" "}
                      {pluralize(room.availableBeds, "bed")} free
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || options.length === 0}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : <MoveRight aria-hidden />}
            Move student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
