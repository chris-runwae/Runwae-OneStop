import React from "react";
import { AdminSidebar } from "./_sidebar";
import { AdminHeader } from "./_header";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="ml-64 flex flex-1 min-w-0 flex-col">
        <AdminHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
