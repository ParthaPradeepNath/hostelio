import type { Metadata } from "next";
import { cookies } from "next/headers";

import { Providers } from "@/components/providers";
import { normalizeTheme, THEME_COOKIE } from "@/lib/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hostelio",
    template: "%s · Hostelio",
  },
  description: "Hostel management for students and wardens.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html lang="en" data-theme={theme}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
