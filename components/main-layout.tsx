import React from "react"
import { Suspense } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { getCurrentUser } from '@/lib/auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

export async function MainLayout({ children }: MainLayoutProps) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div className="min-h-screen bg-background stars-bg">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar isAdmin={isAdmin} />
      </Suspense>
      <div className="ml-60">
        <Header user={user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-border bg-sidebar animate-pulse">
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="h-6 w-24 rounded bg-muted" />
      </div>
    </aside>
  );
}
