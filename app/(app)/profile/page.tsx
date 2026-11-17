import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your identity, contact details, and hostel account information."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5">
          <Card>
            <CardContent className="mt-0">
              <div className="flex items-center gap-4">
                <span className="flex size-14 items-center justify-center rounded-pill bg-accent-soft text-[18px] font-semibold text-accent">
                  {initials(user.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-semibold text-ink" title={user.name}>
                    {user.name}
                  </p>
                  <p className="truncate text-[13px] text-ink-secondary" title={user.email}>
                    {user.email}
                  </p>
                  <div className="mt-1.5">
                    <Badge tone={user.role === "ADMIN" ? "accent" : "neutral"}>
                      {user.role === "ADMIN" ? "Administrator" : "Student"}
                    </Badge>
                  </div>
                </div>
              </div>
              {user.role === "STUDENT" ? (
                <dl className="mt-5 flex flex-col gap-2.5 border-t border-line pt-4 text-[13px]">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-tertiary">Student ID</dt>
                    <dd className="text-ink">{user.studentId ?? "Not set"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-tertiary">Department</dt>
                    <dd className="truncate text-right text-ink" title={user.department ?? undefined}>
                      {user.department ?? "Not set"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-tertiary">Year</dt>
                    <dd className="text-ink">{user.year ? `Year ${user.year}` : "Not set"}</dd>
                  </div>
                </dl>
              ) : null}
              <p className="mt-4 border-t border-line pt-4 text-[12px] text-ink-tertiary">
                Joined {formatDate(user.createdAt)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3 text-[13px]">
                <div>
                  <dt className="text-ink-tertiary">Email</dt>
                  <dd className="mt-0.5 break-all text-ink">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-ink-tertiary">Role</dt>
                  <dd className="mt-0.5 text-ink">
                    {user.role === "ADMIN" ? "Administrator" : "Student"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-tertiary">Account ID</dt>
                  <dd className="mt-0.5 break-all font-mono text-[11px] text-ink-secondary">
                    {user.id}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              user={{
                role: user.role,
                name: user.name,
                phone: user.phone,
                studentId: user.studentId,
                department: user.department,
                year: user.year,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
