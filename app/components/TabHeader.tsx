"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import Popover from "@/app/components/Popover";
import type { CurrentUser } from "@/lib/useCurrentUser";

type Tab = { href: string; label: string };

const tabs: Tab[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employee", label: "Employee" },
  { href: "/bill", label: "Bill" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setIsPopoverOpen(false);
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="text-lg font-bold text-black">FZ Fabrics</div>

        <nav className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-700 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
   
          {user && (
            <Popover
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
              trigger={
                <button
                  onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                  aria-label="User menu"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
              }
              position="right"
              className="w-64"
            >
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 text-white font-semibold text-lg flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </Popover>
          )}
        </nav>
      </div>
    </header>
  );
}
