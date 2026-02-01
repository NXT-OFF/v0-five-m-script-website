'use client';

import React from "react"

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/types';
import {
  Home,
  Code,
  Building,
  Car,
  Shirt,
  Crosshair,
  Map,
  Wrench,
  Users,
  Monitor,
  Volume2,
  Database,
  Star,
  Settings,
  Shield,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Code,
  Building,
  Car,
  Shirt,
  Crosshair,
  Map,
  Wrench,
  Users,
  Monitor,
  Volume2,
  Database,
};

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">FM</span>
          </div>
          <span className="text-xl font-bold text-foreground">FiveM Hub</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {CATEGORIES.map((category) => {
              const Icon = iconMap[category.icon] || Home;
              const isActive = currentCategory === category.id;
              const href = category.id === 'all' ? '/' : `/?category=${category.id}`;

              return (
                <Link
                  key={category.id}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{category.name}</span>
                  {category.id === 'all' && (
                    <Star className="ml-auto h-4 w-4 text-yellow-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                Administration
              </p>
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === '/admin'
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Shield className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/resources"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === '/admin/resources'
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Settings className="h-5 w-5" />
                <span>Manage Resources</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground">
            FiveM Hub v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
