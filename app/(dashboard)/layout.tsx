'use client';

import React from 'react';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import {
  CircleIcon,
  Home,
  LogOut,
  Users,
  Settings,
  Shield,
  Activity,
  CreditCard,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9 border-2 border-orange-500">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n: string) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <span className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
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
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-100 border-r border-orange-200 shadow-sm">
      <div className="flex items-center gap-2 px-6 py-6">
        <CircleIcon className="h-8 w-8 text-orange-500" />
        <span className="text-2xl font-bold text-orange-600 tracking-tight">Meraki</span>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <span
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${pathname === item.href ? 'bg-orange-100 text-orange-700' : 'text-gray-700 hover:bg-orange-50'}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-orange-100">
        <Suspense fallback={<div className="h-9" />}>
          <UserMenu />
        </Suspense>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="flex items-center">
            <CircleIcon className="h-7 w-7 text-white" />
            <span className="ml-2 text-2xl font-extrabold text-white tracking-tight">
              Meraki Solution
            </span>
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-2">
          <Breadcrumbs />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </section>
  );
}
