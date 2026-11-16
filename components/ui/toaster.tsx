"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

type ResolvedTheme = "light" | "dark";

function resolveTheme(): ResolvedTheme {
  const preference = document.documentElement.dataset.theme;
  if (preference === "light" || preference === "dark") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function Toaster() {
  const [position, setPosition] = useState<ToasterProps["position"]>("top-right");
  const [theme, setTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setPosition(query.matches ? "bottom-center" : "top-right");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setTheme(resolveTheme());
    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    colorScheme.addEventListener("change", update);

    return () => {
      observer.disconnect();
      colorScheme.removeEventListener("change", update);
    };
  }, []);

  return (
    <Sonner
      theme={theme}
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
