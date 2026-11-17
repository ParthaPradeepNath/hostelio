"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";

import { useRouter } from "next/navigation";

import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import type { ActiveRoomOption } from "@/components/complaints/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiClientError, apiRequest, errorMessage } from "@/lib/client/api";
import { useAppForm } from "@/lib/client/use-app-form";
import { enumLabel } from "@/lib/utils";
import {
  COMPLAINT_CATEGORIES,
  complaintCreateSchema,
} from "@/lib/validators/complaint";

export function NewComplaintDialog({
  activeRoom,
}: {
  activeRoom: ActiveRoomOption;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useAppForm(complaintCreateSchema, {
    title: "",
    description: "",
    category: undefined,
    ...(activeRoom ? { roomId: activeRoom.id } : {}),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: {
    title: string;
    description: string;
    category?: string;
    roomId?: string;
  }) {
    try {
      await apiRequest("/api/complaints", {
        method: "POST",
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          ...(values.category ? { category: values.category } : {}),
          ...(activeRoom ? { roomId: activeRoom.id } : {}),
        }),
      });
      toast.success("Complaint raised", {
        description: "We are analyzing it and will route it to the right team.",
      });
      setOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      if (error instanceof ApiClientError && error.details) {
        for (const [field, message] of Object.entries(error.details)) {
          if (
            field === "title" ||
            field === "description" ||
            field === "category"
          ) {
            setError(field, { message });
          }
        }
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden />
          New complaint
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="new-complaint-description">
        <DialogHeader>
          <DialogTitle>Raise a complaint</DialogTitle>
          <DialogDescription id="new-complaint-description">
            Describe the issue clearly. Photos are not supported. Up to 5
            complaints per hour.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 flex flex-col gap-4"
          noValidate
        >
          <Field
            label="Title"
            htmlFor="complaint-title"
            error={errors.title?.message}
          >
            <Input
              id="complaint-title"
              placeholder="Leaking tap in the bathroom"
              autoComplete="off"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={
                errors.title ? "complaint-title-error" : undefined
              }
              {...register("title")}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="complaint-description"
            error={errors.description?.message}
            hint="Include what happened, where, and since when."
          >
            <Textarea
              id="complaint-description"
              rows={5}
              placeholder="The tap in the shared bathroom on floor 2 has been leaking since yesterday. Water is pooling on the floor."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description
                  ? "complaint-description-error"
                  : "complaint-description-hint"
              }
              {...register("description")}
            />
          </Field>

          <Field
            label="Room"
            htmlFor="complaint-room"
            hint={
              activeRoom
                ? undefined
                : "No active allocation. The complaint is raised without a room."
            }
          >
            <Input
              id="complaint-room"
              value={
                activeRoom
                  ? `${activeRoom.roomNumber} · Block ${activeRoom.block}`
                  : "No active room"
              }
              readOnly
              disabled
            />
          </Field>

          <Field
            label="Category"
            htmlFor="complaint-category"
            error={errors.category?.message}
            hint="Leave on automatic to let AI classify it."
          >
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  value={field.value ?? "auto"}
                  onValueChange={(value) =>
                    field.onChange(value === "auto" ? undefined : value)
                  }
                >
                  <SelectTrigger
                    id="complaint-category"
                    aria-describedby={
                      errors.category
                        ? "complaint-category-error"
                        : "complaint-category-hint"
                    }
                  >
                    <SelectValue placeholder="Let AI detect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Let AI detect</SelectItem>
                    {COMPLAINT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {enumLabel(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden
                />
              ) : null}
              Raise complaint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
