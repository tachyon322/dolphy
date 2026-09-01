import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { SolanaProvider } from "@/components/providers/SolanaProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { PrivyWrapper } from "@/components/providers/PrivyWrapper";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "dolphy — compute, released.",
  description:
    "Idle GPUs wake up. Compute flows like water — guided, not forced — to where it's needed. Dolphy releases idle power onto an open market.",
  icons: {
    icon: "/img/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[var(--bg-app)]">
        <PrivyWrapper>
          <QueryProvider>
            <SolanaProvider>
              <LocaleProvider>
                <Navbar />
                {children}
                <Toaster richColors position="top-right" />
              </LocaleProvider>
            </SolanaProvider>
          </QueryProvider>
        </PrivyWrapper>
      </body>
    </html>
  );
}
