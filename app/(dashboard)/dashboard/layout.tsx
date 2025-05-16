'use client';

import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu, CreditCard } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: Users, label: 'Team' },
    { href: '/dashboard/clients', icon: Users, label: 'Clients' },
    { href: '/dashboard/invoices', icon: CreditCard, label: 'Invoices' },
    { href: '/dashboard/expenses', icon: CreditCard, label: 'Expenses' },
    { href: '/dashboard/time-tracking', icon: CreditCard, label: 'Time Tracking' },
    { href: '/dashboard/reports', icon: CreditCard, label: 'Reports' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
    { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100dvh-68px)] flex flex-col">
      <main className="flex-1 overflow-y-auto p-0 lg:p-4">
        {children}
      </main>
    </div>
  );
}
