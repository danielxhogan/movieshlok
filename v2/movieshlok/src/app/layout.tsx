import "@/globals.css";
import Body from "@/components/layout/Body";

import type { Metadata } from "next";

import { TRPCProvider } from "@/api/TRPCProvider";
import { ClerkProvider } from "@clerk/nextjs";

import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <TRPCProvider>
        <html lang="en" suppressHydrationWarning>
          <Body inter={inter}>{children}</Body>
        </html>
      </TRPCProvider>
    </ClerkProvider>
  );
}
