"use client";

import { ModeToggle } from "@/components/navigation";
import { AdminMenu } from "@/components/admin/admin-menu";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <AdminMenu />

      <main>
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}

