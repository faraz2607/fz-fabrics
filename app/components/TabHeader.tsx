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
  { href: "/thread", label: "Thread" },
  { href: "/employee", label: "Employee" },
  { href: "/bill", label: "Bill" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="w-full flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
        <div className="text-base sm:text-lg font-bold text-black">FZ Fabrics</div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-3">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
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
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          {user && (
            <div className="border-b border-gray-200">
              <div className="w-full flex items-center gap-2 px-3 py-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-black truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <div className="px-3 py-2 space-y-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-700 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
            {user && (
              <button
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
                className="w-full text-left block rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black transition disabled:bg-gray-50 disabled:text-gray-400"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
