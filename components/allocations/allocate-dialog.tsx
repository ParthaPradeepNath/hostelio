"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest, errorMessage } from "@/lib/client/api";
import { cn, pluralize } from "@/lib/utils";

export type AllocateStudent = {
  id: string;
  name: string;
  email: string;
  studentId: string | null;
};

export type AllocateRoom = {
  id: string;
  roomNumber: string;
  block: string;
  floor: number;
  type: string;
  capacity: number;
  availableBeds: number;
};

export function AllocateDialog({
  students,
  rooms,
}: {
  students: AllocateStudent[];
  rooms: AllocateRoom[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const [roomQuery, setRoomQuery] = useState("");
  const [studentId, setStudentId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [pending, setPending] = useState(false);

  const filteredStudents = useMemo(() => {
    const query = studentQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      [student.name, student.email, student.studentId ?? ""].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [students, studentQuery]);

  const filteredRooms = useMemo(() => {
    const query = roomQuery.trim().toLowerCase();
    if (!query) return rooms;
    return rooms.filter((room) =>
      `${room.roomNumber} ${room.block}`.toLowerCase().includes(query),
    );
  }, [rooms, roomQuery]);

  const selectedStudent = students.find((student) => student.id === studentId);
  const selectedRoom = rooms.find((room) => room.id === roomId);

  async function submit() {
    if (!studentId || !roomId) {
      toast.error("Choose a student and a room");
      return;
    }
    setPending(true);
    try {
      await apiRequest("/api/allocations", {
        method: "POST",
        body: JSON.stringify({ studentId, roomId }),
      });
      toast.success(`${selectedStudent?.name ?? "Student"} allocated to ${selectedRoom?.roomNumber}`);
      setOpen(false);
      setStudentId("");
      setRoomId("");
      setStudentQuery("");
      setRoomQuery("");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden />
          Allocate student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[35rem]" aria-describedby="allocate-description">
        <DialogHeader>
          <DialogTitle>Allocate a student</DialogTitle>
          <DialogDescription id="allocate-description">
            Students can hold one active allocation. Only rooms with free beds are listed.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col">
            <p className="type-label text-ink">Student</p>
            <div className="relative mt-1.5">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary"
                aria-hidden
              />
              <Input
                value={studentQuery}
                onChange={(event) => setStudentQuery(event.target.value)}
                placeholder="Search unallocated students"
                aria-label="Search unallocated students"
                className="pl-9"
              />
            </div>
            <ul
              aria-label="Unallocated students"
              className="mt-2 max-h-64 overflow-y-auto rounded-md border border-line"
            >
              {filteredStudents.length === 0 ? (
                <li className="px-3 py-4 text-[12px] text-ink-tertiary">
                  {students.length === 0
                    ? "Every student already has an active allocation."
                    : "No students match this search."}
                </li>
              ) : (
                filteredStudents.map((student) => {
                  const selected = student.id === studentId;
                  return (
                    <li key={student.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setStudentId(student.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2.5 text-left transition-colors last:border-b-0",
                          selected ? "bg-accent-soft" : "hover:bg-surface-hover",
                        )}
                      >
                        <span className="min-w-0">
                          <span
                            className="block truncate text-[13px] font-medium text-ink"
                            title={student.name}
                          >
                            {student.name}
                          </span>
                          <span
                            className="block truncate text-[11px] text-ink-secondary"
                            title={student.studentId ?? student.email}
                          >
                            {student.studentId ?? student.email}
                          </span>
                        </span>
                        {selected ? <Check className="size-4 shrink-0 text-accent" aria-hidden /> : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          <div className="flex min-w-0 flex-col">
            <p className="type-label text-ink">Room</p>
            <div className="relative mt-1.5">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary"
                aria-hidden
              />
              <Input
                value={roomQuery}
                onChange={(event) => setRoomQuery(event.target.value)}
                placeholder="Search rooms with free beds"
                aria-label="Search available rooms"
                className="pl-9"
              />
            </div>
            <ul
              aria-label="Available rooms"
              className="mt-2 max-h-64 overflow-y-auto rounded-md border border-line"
            >
              {filteredRooms.length === 0 ? (
                <li className="px-3 py-4 text-[12px] text-ink-tertiary">
                  {rooms.length === 0
                    ? "No room has a free bed right now."
                    : "No rooms match this search."}
                </li>
              ) : (
                filteredRooms.map((room) => {
                  const selected = room.id === roomId;
                  return (
                    <li key={room.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setRoomId(room.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2.5 text-left transition-colors last:border-b-0",
                          selected ? "bg-accent-soft" : "hover:bg-surface-hover",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-ink">
                            {room.roomNumber}
                          </span>
                          <span className="block truncate text-[11px] text-ink-secondary">
                            Block {room.block} · Floor {room.floor} · {pluralize(room.availableBeds, "bed")} free
                          </span>
                        </span>
                        {selected ? <Check className="size-4 shrink-0 text-accent" aria-hidden /> : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || !studentId || !roomId}>
            {pending ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden /> : null}
            Allocate room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
