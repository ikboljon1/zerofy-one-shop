
import React, { ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <main>{children}</main>
      </div>
      <Toaster />
    </div>
  );
};

export default Layout;
