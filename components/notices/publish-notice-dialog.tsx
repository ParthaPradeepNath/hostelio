"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Loader2, Megaphone } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiClientError, apiRequest, errorMessage } from "@/lib/client/api";
import { useAppForm } from "@/lib/client/use-app-form";
import { noticeCreateSchema } from "@/lib/validators/notice";

export function PublishNoticeDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useAppForm(noticeCreateSchema, {
    title: "",
    content: "",
    isPinned: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const isPinned = watch("isPinned");

  async function onSubmit(values: {
    title: string;
    content: string;
    isPinned: boolean;
  }) {
    try {
      await apiRequest("/api/notices", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Notice published");
      setOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      if (error instanceof ApiClientError && error.details) {
        for (const [field, message] of Object.entries(error.details)) {
          if (field === "title" || field === "content") {
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
          <Megaphone aria-hidden />
          Publish notice
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="publish-notice-description">
        <DialogHeader>
          <DialogTitle>Publish a notice</DialogTitle>
          <DialogDescription id="publish-notice-description">
            Notices are visible to every student and cannot be edited or deleted
            after publishing.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 flex flex-col gap-4"
          noValidate
        >
          <Field
            label="Title"
            htmlFor="notice-title"
            error={errors.title?.message}
          >
            <Input
              id="notice-title"
              placeholder="Water supply interruption on Saturday"
              autoComplete="off"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "notice-title-error" : undefined}
              {...register("title")}
            />
          </Field>

          <Field
            label="Content"
            htmlFor="notice-content"
            error={errors.content?.message}
            hint="Line breaks are preserved."
          >
            <Textarea
              id="notice-content"
              rows={7}
              placeholder="Block A will have no water supply from 10:00 to 14:00..."
              aria-invalid={Boolean(errors.content)}
              aria-describedby={
                errors.content ? "notice-content-error" : "notice-content-hint"
              }
              {...register("content")}
            />
          </Field>

          <div className="border-line bg-surface-2 flex items-center justify-between gap-4 rounded-md border px-3.5 py-3">
            <div className="min-w-0">
              <Label htmlFor="notice-pinned">Pin to top</Label>
              <p className="text-ink-tertiary mt-0.5 text-[12px]">
                Pinned notices appear above the chronological list.
              </p>
            </div>
            <Switch
              id="notice-pinned"
              checked={isPinned}
              onCheckedChange={(checked) => setValue("isPinned", checked)}
            />
          </div>

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
              Publish notice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
