import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function AppSidebar({ role }: { role: "STUDENT" | "ADMIN" }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface px-4 py-4 lg:flex">
      <div className="px-2 pb-6">
        <Brand />
      </div>
      <SidebarNav role={role} />
      <div className="mt-auto px-2 pt-6">
        <p className="type-caption">Hostel operations</p>
      </div>
    </aside>
  );
}
