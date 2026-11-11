"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, errorMessage } from "@/lib/client/api";
import { COMPLAINT_CATEGORIES, PRIORITIES, ALLOWED_TRANSITIONS } from "@/lib/validators/complaint";
import { enumLabel } from "@/lib/utils";

const TRANSITION_LABELS: Record<string, string> = {
  IN_PROGRESS: "Start work",
  RESOLVED: "Mark resolved",
  REJECTED: "Reject",
};

export function AdminTriage({
  complaint,
}: {
  complaint: {
    id: string;
    status: string;
    priority: string;
    category: string;
    adminResponse: string | null;
  };
}) {
  const router = useRouter();
  const [priority, setPriority] = useState(complaint.priority);
  const [category, setCategory] = useState(complaint.category);
  const [response, setResponse] = useState(complaint.adminResponse ?? "");
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const transitions = ALLOWED_TRANSITIONS[complaint.status] ?? [];
  const changed =
    Boolean(nextStatus) ||
    priority !== complaint.priority ||
    category !== complaint.category ||
    response !== (complaint.adminResponse ?? "");

  async function save() {
    setPending(true);
    try {
      await apiRequest(`/api/complaints/${complaint.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...(nextStatus ? { status: nextStatus } : {}),
          ...(priority !== complaint.priority ? { priority } : {}),
          ...(category !== complaint.category ? { category } : {}),
          ...(response !== (complaint.adminResponse ?? "") ? { adminResponse: response } : {}),
        }),
      });
      toast.success("Complaint updated");
      setNextStatus(null);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="type-label text-ink">Move status</p>
        {transitions.length === 0 ? (
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
            This complaint is rejected and closed. Rejecting is final — if the issue returns, ask the
            student to raise a new complaint.
          </p>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap gap-2">
              {transitions.map((status) => {
                const selected = nextStatus === status;
                return (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={
                      selected
                        ? status === "REJECTED"
                          ? "destructive"
                          : "primary"
                        : "secondary"
                    }
                    aria-pressed={selected}
                    disabled={pending}
                    onClick={() => setNextStatus(selected ? null : status)}
                  >
                    {TRANSITION_LABELS[status] ?? enumLabel(status)}
                  </Button>
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-ink-tertiary">
              {complaint.status === "RESOLVED"
                ? "Resolved complaints can be reopened if the issue persists."
                : "Choose a new status, then save to apply it with the changes below."}
            </p>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Priority" htmlFor="triage-priority">
          <Select value={priority} onValueChange={setPriority} disabled={pending}>
            <SelectTrigger id="triage-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {enumLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Category" htmlFor="triage-category">
          <Select value={category} onValueChange={setCategory} disabled={pending}>
            <SelectTrigger id="triage-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPLAINT_CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {enumLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label="Response to student"
        htmlFor="triage-response"
        hint="Shown to the student on this complaint. Keep it specific and actionable."
      >
        <Textarea
          id="triage-response"
          rows={4}
          value={response}
          onChange={(event) => setResponse(event.target.value)}
          placeholder="An electrician will visit tomorrow between 10:00 and 12:00."
          disabled={pending}
          maxLength={2000}
        />
      </Field>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-ink-tertiary">
          {response.length > 0 ? `${response.length}/2000 characters` : "No response yet"}
        </p>
        <Button type="button" onClick={save} disabled={pending || !changed}>
          {pending ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden /> : <Save aria-hidden />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
