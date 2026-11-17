import { Badge } from "@/components/ui/badge";

export function RoleBadge({ role }: { role: "STUDENT" | "ADMIN" }) {
  return (
    <Badge
      tone={role === "ADMIN" ? "accent" : "neutral"}
      className="hidden sm:inline-flex"
    >
      {role === "ADMIN" ? "Administrator" : "Student"}
    </Badge>
  );
}
