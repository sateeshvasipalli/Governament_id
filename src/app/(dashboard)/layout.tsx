
'use client';

import Link from 'next/link';
import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <nav className="hidden w-full flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
             <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0Z" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" />
              </svg>
            <span className="font-bold">VeriDash</span>
          </Link>
          <DashboardNav />
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
               <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-primary"
                    >
                        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0Z" />
                        <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" />
                    </svg>
                    <span className="font-bold">VeriDash</span>
                </Link>
              <DashboardNav isMobile={true} />
            </nav>
          </SheetContent>
        </Sheet>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
