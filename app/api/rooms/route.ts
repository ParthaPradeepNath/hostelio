import { parseQuery, withAuth } from "@/lib/api/handler";
import { created, ok } from "@/lib/api/responses";
import { createRoom, listRooms } from "@/lib/services/rooms";
import { roomCreateSchema, roomQuerySchema } from "@/lib/validators/room";

export const GET = withAuth({}, async ({ req }) => {
  const query = parseQuery(roomQuerySchema, req.nextUrl.searchParams);
  const result = await listRooms(query);
  return ok(result.data, result.meta);
});

export const POST = withAuth({ role: "ADMIN", schema: roomCreateSchema }, async ({ body }) => {
  return created(await createRoom(body));
});
