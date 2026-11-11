"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { RoleBadge } from "@/components/layout/role-badge";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  SheetContent,
} from "@/components/ui/dialog";

export function MobileNav({ role }: { role: "STUDENT" | "ADMIN" }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation" className="lg:hidden">
          <Menu />
        </Button>
      </DialogTrigger>
      <SheetContent aria-describedby={undefined} className="flex flex-col p-4">
        <DialogTitle className="sr-only">Navigation</DialogTitle>
        <div className="px-2 pb-6">
          <Brand />
        </div>
        <SidebarNav role={role} onNavigate={() => setOpen(false)} />
        <div className="mt-auto px-2 pt-6">
          <RoleBadge role={role} />
        </div>
      </SheetContent>
    </Dialog>
  );
}
