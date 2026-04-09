import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HITAM Native EMS",
  description: "Next-Generation Event Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Try securely grabbing the dynamic theme role based on server session
  const headersList = await headers();
  const sessionData = await auth.api.getSession({
    headers: headersList
  });

  // Developer Bypass
  const devRole = process.env.NODE_ENV === "development" ? headersList.get("x-ems-role") : null;
  const role = devRole || (sessionData?.user as any)?.role || "STUDENT";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-role={role}
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 ease-in-out">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
