import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BedDouble, Building2, IndianRupee, Layers, Users } from "lucide-react";
import { AllocationRowActions } from "@/components/allocations/allocation-actions";
import type { AllocatableRoom } from "@/components/allocations/move-room-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { MaintenanceButton } from "@/components/rooms/maintenance-button";
import { RoomFormDialog } from "@/components/rooms/room-form-dialog";
import type { RoomListItem } from "@/components/rooms/types";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAppError } from "@/lib/api/errors";
import { listAllocatableRooms } from "@/lib/services/allocations";
import { getRoomDetails } from "@/lib/services/rooms";
import { formatDate, formatRent, pluralize } from "@/lib/utils";
import { BEDS_BY_TYPE } from "@/lib/validators/room";

const TYPE_LABELS: Record<string, string> = {
  SINGLE: "Single",
  DOUBLE: "Double",
  TRIPLE: "Triple",
  QUAD: "Quad",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const { room } = await getRoomDetails(id);
    return { title: `Room ${room.roomNumber}` };
  } catch {
    return { title: "Room" };
  }
}

export default async function RoomDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let details: Awaited<ReturnType<typeof getRoomDetails>>;
  try {
    details = await getRoomDetails(id);
  } catch (error) {
    if (isAppError(error) && error.code === "NOT_FOUND") notFound();
    throw error;
  }

  const { room, occupants, complaints } = details;
  const isAdmin = user.role === "ADMIN";
  const allocatable: AllocatableRoom[] = isAdmin ? await listAllocatableRooms() : [];

  const roomForDialog: RoomListItem = {
    id: room.id,
    roomNumber: room.roomNumber,
    block: room.block,
    floor: room.floor,
    type: room.type,
    capacity: room.capacity,
    monthlyRent: room.monthlyRent,
    status: room.status,
    amenities: room.amenities,
    notes: room.notes,
    occupancy: room.occupancy,
    availableBeds: room.availableBeds,
  };

  const occupancyPercent = room.capacity > 0 ? (room.occupancy / room.capacity) * 100 : 0;

  return (
    <div>
      <Link
        href="/rooms"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        All rooms
      </Link>

      <PageHeader
        title={`Room ${room.roomNumber}`}
        description={`Block ${room.block}, floor ${room.floor}. ${TYPE_LABELS[room.type]} room with ${
          room.capacity
        } ${room.capacity === 1 ? "bed" : "beds"}.`}
      >
        <StatusBadge value={room.status} />
        {isAdmin ? (
          <>
            <RoomFormDialog
              mode="edit"
              room={roomForDialog}
              trigger={
                <Button variant="secondary" size="sm">
                  Edit room
                </Button>
              }
            />
            <MaintenanceButton
              roomId={room.id}
              roomNumber={room.roomNumber}
              status={room.status}
              occupied={room.occupancy}
            />
          </>
        ) : null}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-4">
              <p className="tabular text-[28px] font-semibold leading-none text-ink">
                {room.occupancy}
                <span className="text-[16px] font-normal text-ink-tertiary"> / {room.capacity}</span>
              </p>
              <p className="text-[13px] text-ink-secondary">
                {pluralize(room.availableBeds, "bed")} available
              </p>
            </div>
            <Progress
              value={occupancyPercent}
              className="mt-3"
              aria-label={`${room.occupancy} of ${room.capacity} beds occupied`}
            />

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-[13px] sm:grid-cols-3">
              <div>
                <p className="text-ink-tertiary">Block</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-ink">
                  <Building2 className="size-3.5 text-ink-tertiary" aria-hidden />
                  {room.block}
                </p>
              </div>
              <div>
                <p className="text-ink-tertiary">Floor</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-ink">
                  <Layers className="size-3.5 text-ink-tertiary" aria-hidden />
                  {room.floor}
                </p>
              </div>
              <div>
                <p className="text-ink-tertiary">Room type</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-ink">
                  <BedDouble className="size-3.5 text-ink-tertiary" aria-hidden />
                  {TYPE_LABELS[room.type]} ({BEDS_BY_TYPE[room.type]} bed
                  {BEDS_BY_TYPE[room.type] === 1 ? "" : "s"})
                </p>
              </div>
              <div>
                <p className="text-ink-tertiary">Monthly rent</p>
                <p className="tabular mt-0.5 flex items-center gap-1.5 text-ink">
                  <IndianRupee className="size-3.5 text-ink-tertiary" aria-hidden />
                  {room.monthlyRent === null ? "Not set" : formatRent(room.monthlyRent)}
                </p>
              </div>
              <div>
                <p className="text-ink-tertiary">Active occupants</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-ink">
                  <Users className="size-3.5 text-ink-tertiary" aria-hidden />
                  {room.occupancy}
                </p>
              </div>
              <div>
                <p className="text-ink-tertiary">Status</p>
                <p className="mt-1.5">
                  <StatusBadge value={room.status} />
                </p>
              </div>
            </div>

            {room.amenities.length > 0 ? (
              <>
                <Separator className="my-5" />
                <p className="type-label text-ink">Amenities</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {room.amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="rounded-pill border border-line bg-surface-2 px-2.5 py-1 text-[12px] text-ink-secondary"
                    >
                      {amenity}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {room.notes ? (
              <>
                <Separator className="my-5" />
                <p className="type-label text-ink">Notes</p>
                <p className="type-reading mt-1.5 text-[13px] text-ink-secondary">{room.notes}</p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isAdmin ? "Occupants" : "Your room at a glance"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              occupants.length === 0 ? (
                <p className="text-[13px] leading-relaxed text-ink-secondary">
                  No students are allocated to this room.{" "}
                  <Link href="/allocations" className="text-accent hover:underline">
                    Allocate a student
                  </Link>
                  .
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {occupants.map((occupant) => (
                    <li key={occupant.allocationId} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium text-ink">{occupant.name}</p>
                          <p className="truncate text-[12px] text-ink-secondary">
                            {occupant.studentId ?? "No student ID"} · Since{" "}
                            {formatDate(occupant.startDate)}
                          </p>
                        </div>
                      </div>
                      <AllocationRowActions
                        allocationId={occupant.allocationId}
                        studentName={occupant.name}
                        roomId={room.id}
                        rooms={allocatable}
                        compact
                      />
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <div className="text-[13px] leading-relaxed text-ink-secondary">
                <p className="text-ink">
                  {room.occupancy === 0
                    ? "No one is currently allocated here."
                    : `${pluralize(room.occupancy, "bed")} of ${room.capacity} occupied.`}
                </p>
                <p className="mt-2">
                  {room.availableBeds > 0
                    ? `${pluralize(room.availableBeds, "bed")} available. Contact the hostel office to request this room.`
                    : "This room is full. Contact the hostel office to join the waiting list."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {isAdmin ? (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent room complaints</CardTitle>
            </CardHeader>
            <CardContent>
              {complaints.length === 0 ? (
                <p className="text-[13px] text-ink-secondary">
                  No complaints have been raised for this room.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {complaints.map((complaint) => (
                    <li key={complaint.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <Link
                          href={`/complaints/${complaint.id}`}
                          className="block truncate text-[14px] font-medium text-ink hover:text-accent"
                        >
                          {complaint.title}
                        </Link>
                        <p className="text-[12px] text-ink-secondary">
                          {complaint.student.name} · {formatDate(complaint.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge value={complaint.priority} dot={false} />
                        <StatusBadge value={complaint.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
