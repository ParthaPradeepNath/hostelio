import { withAuth } from "@/lib/api/handler";
import { ok } from "@/lib/api/responses";
import { updateRoom } from "@/lib/services/rooms";
import { roomUpdateSchema } from "@/lib/validators/room";

export const PUT = withAuth({ role: "ADMIN", schema: roomUpdateSchema }, async ({ params, body }) => {
  return ok(await updateRoom(params.id, body));
});
