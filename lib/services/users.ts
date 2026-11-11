import { Prisma, type User } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { AppError } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import type { ProfileUpdateInput } from "@/lib/validators/profile";

export async function updateProfile(user: User, input: ProfileUpdateInput) {
  const data: Prisma.UserUpdateInput = {};

  if (user.role === "ADMIN") {
    if (input.phone !== undefined) data.phone = input.phone;
  } else {
    if (input.name !== undefined && input.name !== user.name) {
      data.name = input.name;
      try {
        const client = await clerkClient();
        const [firstName, ...rest] = input.name.split(/\s+/);
        await client.users.updateUser(user.clerkUserId, {
          firstName,
          lastName: rest.join(" ") || undefined,
        });
      } catch (error) {
        console.warn("Could not sync the updated name to Clerk", error instanceof Error ? error.message : error);
      }
    }
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.studentId !== undefined) data.studentId = input.studentId;
    if (input.department !== undefined) data.department = input.department;
    if (input.year !== undefined) data.year = input.year;
  }

  try {
    return await prisma.user.update({ where: { id: user.id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("VALIDATION_ERROR", "That student ID is already in use", {
        studentId: "This student ID belongs to another account",
      });
    }
    throw error;
  }
}
