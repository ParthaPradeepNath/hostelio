"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiClientError, apiRequest, errorMessage } from "@/lib/client/api";
import { useAppForm } from "@/lib/client/use-app-form";
import { BEDS_BY_TYPE, roomCreateSchema, roomUpdateSchema } from "@/lib/validators/room";
import type { RoomListItem, RoomStatusValue, RoomTypeValue } from "@/components/rooms/types";

const TYPE_LABELS: Record<RoomTypeValue, string> = {
  SINGLE: "Single",
  DOUBLE: "Double",
  TRIPLE: "Triple",
  QUAD: "Quad",
};

const CREATE_STATUS: RoomStatusValue[] = ["AVAILABLE", "MAINTENANCE"];
const EDIT_STATUS: RoomStatusValue[] = ["AVAILABLE", "FULL", "MAINTENANCE"];

function parseAmenities(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function RoomFormDialog({
  mode,
  room,
  trigger,
  onSaved,
}: {
  mode: "create" | "edit";
  room?: RoomListItem;
  trigger: React.ReactNode;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amenitiesText, setAmenitiesText] = useState(room?.amenities.join(", ") ?? "");
  const schema = mode === "create" ? roomCreateSchema : roomUpdateSchema;

  const form = useAppForm(
    schema,
    mode === "create"
      ? {
          roomNumber: "",
          block: "",
          floor: 1,
          type: "DOUBLE",
          capacity: 2,
          monthlyRent: null,
          status: "AVAILABLE",
          amenities: [],
          notes: null,
        }
      : {
          roomNumber: room?.roomNumber ?? "",
          block: room?.block ?? "",
          floor: room?.floor ?? 1,
          type: room?.type ?? "DOUBLE",
          capacity: room?.capacity ?? 2,
          monthlyRent: room?.monthlyRent ?? null,
          status: room?.status ?? "AVAILABLE",
          amenities: room?.amenities ?? [],
          notes: room?.notes ?? null,
        },
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: Record<string, unknown>) {
    const payload = {
      ...values,
      amenities: parseAmenities(amenitiesText),
      notes: typeof values.notes === "string" && values.notes.trim() === "" ? null : values.notes,
    };

    try {
      await apiRequest(mode === "create" ? "/api/rooms" : `/api/rooms/${room?.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        body: JSON.stringify(payload),
      });
      toast.success(mode === "create" ? "Room added" : "Room updated");
      setOpen(false);
      onSaved?.();
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      if (error instanceof ApiClientError && error.details) {
        for (const [field, message] of Object.entries(error.details)) {
          form.setError(field as never, { message });
        }
      }
    }
  }

  const statuses = mode === "create" ? CREATE_STATUS : EDIT_STATUS;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent aria-describedby="room-form-description">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add room" : `Edit ${room?.roomNumber}`}</DialogTitle>
          <DialogDescription id="room-form-description">
            {mode === "create"
              ? "Create a room with a type, capacity, and rent. Rooms are never deleted."
              : "Update room details. Availability is derived from occupancy."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Room number" htmlFor="roomNumber" error={errors.roomNumber?.message} hint="For example A-101">
              <Input
                id="roomNumber"
                placeholder="A-101"
                autoComplete="off"
                aria-invalid={Boolean(errors.roomNumber)}
                aria-describedby={errors.roomNumber ? "roomNumber-error" : "roomNumber-hint"}
                {...register("roomNumber")}
              />
            </Field>
            <Field label="Block" htmlFor="block" error={errors.block?.message}>
              <Input
                id="block"
                placeholder="A"
                autoComplete="off"
                aria-invalid={Boolean(errors.block)}
                aria-describedby={errors.block ? "block-error" : undefined}
                {...register("block")}
              />
            </Field>
            <Field label="Floor" htmlFor="floor" error={errors.floor?.message}>
              <Input
                id="floor"
                type="number"
                min={0}
                max={20}
                inputMode="numeric"
                aria-invalid={Boolean(errors.floor)}
                aria-describedby={errors.floor ? "floor-error" : undefined}
                {...register("floor", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Room type" htmlFor="type" error={errors.type?.message}>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value: RoomTypeValue) => {
                      field.onChange(value);
                      setValue("capacity", BEDS_BY_TYPE[value]);
                    }}
                  >
                    <SelectTrigger id="type" aria-describedby={errors.type ? "type-error" : undefined}>
                      <SelectValue placeholder="Choose a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field
              label="Capacity"
              htmlFor="capacity"
              error={errors.capacity?.message}
              hint="Set automatically from the room type"
            >
              <Input id="capacity" value={BEDS_BY_TYPE[form.watch("type") ?? "DOUBLE"]} readOnly disabled />
            </Field>
            <Field label="Monthly rent (₹)" htmlFor="monthlyRent" error={errors.monthlyRent?.message} hint="Optional">
              <Input
                id="monthlyRent"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                aria-invalid={Boolean(errors.monthlyRent)}
                aria-describedby={errors.monthlyRent ? "monthlyRent-error" : "monthlyRent-hint"}
                {...register("monthlyRent", {
                  setValueAs: (value) => (value === "" ? null : Number(value)),
                })}
              />
            </Field>
            <Field label="Status" htmlFor="status" error={errors.status?.message}>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" aria-describedby={errors.status ? "status-error" : undefined}>
                      <SelectValue placeholder="Choose a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === "AVAILABLE" ? "Available" : status === "FULL" ? "Full" : "Maintenance"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <Field
            label="Amenities"
            htmlFor="amenities"
            error={errors.amenities?.message}
            hint="Separate with commas. Up to 12 items."
          >
            <Input
              id="amenities"
              value={amenitiesText}
              onChange={(event) => {
                setAmenitiesText(event.target.value);
                setValue("amenities", parseAmenities(event.target.value), { shouldValidate: false });
              }}
              placeholder="Wi-Fi, Study table, Fan"
              autoComplete="off"
              aria-invalid={Boolean(errors.amenities)}
              aria-describedby={errors.amenities ? "amenities-error" : "amenities-hint"}
            />
          </Field>

          <Field label="Notes" htmlFor="notes" error={errors.notes?.message} hint="Optional, up to 500 characters">
            <Textarea
              id="notes"
              rows={3}
              placeholder="Anything the warden should know about this room"
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? "notes-error" : "notes-hint"}
              {...register("notes")}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden /> : null}
              {mode === "create" ? "Add room" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
