"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster() {
  const [position, setPosition] = useState<ToasterProps["position"]>("top-right");

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setPosition(query.matches ? "bottom-center" : "top-right");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <Sonner
      theme="system"
      position={position}
      duration={4000}
      gap={8}
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-lg !border !border-line !bg-surface !text-ink !shadow-popover !font-sans",
          title: "!text-[13px] !font-medium !text-ink",
          description: "!text-[12px] !text-ink-secondary",
          actionButton: "!rounded-sm !bg-accent !text-inverse !text-[12px]",
          cancelButton: "!rounded-sm !bg-surface-2 !text-ink !text-[12px]",
        },
      }}
    />
  );
}
