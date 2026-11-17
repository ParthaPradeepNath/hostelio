"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";

import { useRouter } from "next/navigation";

import { Loader2, Pencil } from "lucide-react";
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
  complaintStudentUpdateSchema,
} from "@/lib/validators/complaint";

export function StudentComplaintEdit({
  complaint,
}: {
  complaint: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useAppForm(complaintStudentUpdateSchema, {
    title: complaint.title,
    description: complaint.description,
    category: complaint.category as (typeof COMPLAINT_CATEGORIES)[number],
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
    title?: string;
    description?: string;
    category?: string;
  }) {
    try {
      await apiRequest(`/api/complaints/${complaint.id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      toast.success("Complaint updated");
      setOpen(false);
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
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Pencil aria-hidden />
        Edit complaint
      </Button>
      <DialogContent aria-describedby="edit-complaint-description">
        <DialogHeader>
          <DialogTitle>Edit complaint</DialogTitle>
          <DialogDescription id="edit-complaint-description">
            You can edit while the complaint is open. Once work starts, it
            becomes read-only.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 flex flex-col gap-4"
          noValidate
        >
          <Field
            label="Title"
            htmlFor="edit-complaint-title"
            error={errors.title?.message}
          >
            <Input
              id="edit-complaint-title"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={
                errors.title ? "edit-complaint-title-error" : undefined
              }
              {...register("title")}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="edit-complaint-description"
            error={errors.description?.message}
          >
            <Textarea
              id="edit-complaint-description"
              rows={5}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description
                  ? "edit-complaint-description-error"
                  : undefined
              }
              {...register("description")}
            />
          </Field>

          <Field
            label="Category"
            htmlFor="edit-complaint-category"
            error={errors.category?.message}
          >
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="edit-complaint-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
