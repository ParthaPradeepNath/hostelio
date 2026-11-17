import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RoomsView } from "@/components/rooms/rooms-view";
import type { RoomListItem } from "@/components/rooms/types";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listRoomFacets, listRooms } from "@/lib/services/rooms";
import { roomQuerySchema } from "@/lib/validators/room";

export const metadata: Metadata = { title: "Rooms" };

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const raw = await searchParams;
  const parsed = roomQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : roomQuerySchema.parse({});

  const [result, facets] = await Promise.all([
    listRooms(query),
    listRoomFacets(),
  ]);

  const rooms: RoomListItem[] = result.data.map((room) => ({
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
  }));

  return (
    <RoomsView
      rooms={rooms}
      meta={result.meta}
      filters={{
        block: query.block,
        floor: query.floor,
        type: query.type,
        status: query.status,
        q: query.q,
        page: query.page,
        pageSize: query.pageSize,
      }}
      facets={facets}
      role={user.role}
    />
  );
}
