import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/layout/sidebar-provider";
import { Toaster } from "@/components/ui/sonner";
import { ProfileProvider } from "@/context/profile-context";
import { ProfileModal } from "@/components/profile-modal";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NutriSense AI",
  description: "Contextual Intelligence, Not Calorie Counting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.className} min-h-screen bg-background font-sans antialiased`} suppressHydrationWarning>
        <ProfileProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
          <ProfileModal />
          <Toaster />
        </ProfileProvider>
      </body>
    </html>
  );
}
