
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { LayoutDashboard, ClipboardList } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/validation-results', label: 'All Results' },
];

interface DashboardNavProps {
    isMobile?: boolean;
}

export function DashboardNav({ isMobile = false }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-foreground",
            pathname === item.href ? "text-foreground" : "text-muted-foreground",
            isMobile && "text-lg"
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}
