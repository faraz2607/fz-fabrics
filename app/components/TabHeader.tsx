"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import ChangePasswordModal from "@/app/components/ChangePasswordModal";

type Tab = { href: string; label: string };

const tabs: Tab[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employee", label: "Employee" },
  { href: "/thread", label: "Thread" },
  { href: "/bill", label: "Bill" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const desktopPopoverRef = useRef<HTMLDivElement>(null);
  const mobilePopoverRef = useRef<HTMLDivElement>(null);
  const desktopButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const isAuthPage = pathname?.startsWith('/auth');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isClickInsideDesktopPopover = desktopPopoverRef.current?.contains(event.target as Node);
      const isClickInsideMobilePopover = mobilePopoverRef.current?.contains(event.target as Node);
      const isClickOnDesktopButton = desktopButtonRef.current?.contains(event.target as Node);
      const isClickOnMobileButton = mobileButtonRef.current?.contains(event.target as Node);

      if (!isClickInsideDesktopPopover && !isClickInsideMobilePopover && !isClickOnDesktopButton && !isClickOnMobileButton) {
        setIsPopoverOpen(false);
      }
    }

    if (isPopoverOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isPopoverOpen]);

  const handleLogoutClick = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    event?.stopPropagation();
    setIsLoggingOut(true);
    setIsPopoverOpen(false);
    setIsMobileMenuOpen(false);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.replace("/auth/login");
        return;
      }

      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.replace("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleChangePasswordClick = () => {
    setIsChangePasswordOpen(true);
    setIsPopoverOpen(false);
    setIsMobileMenuOpen(false);
  };

  const firstLetter = user?.name.charAt(0).toUpperCase();

  if (isAuthPage) {
    return null;
  }

  return (
    <>
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
              <div className="relative">
                <button
                  type="button"
                  ref={desktopButtonRef}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsPopoverOpen((prev) => !prev);
                  }}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title={user.name}
                >
                  {firstLetter}
                </button>
                {isPopoverOpen && (
                  <div
                    ref={desktopPopoverRef}
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                          {firstLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        type="button"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleChangePasswordClick();
                        }}
                        className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors font-medium text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Change Password
                      </button>
                    </div>

                    <div className="border-t border-gray-100 p-2">
                      <button
                        type="button"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleLogoutClick(event);
                        }}
                        disabled={isLoggingOut}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile: Menu Button + Profile */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
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
            
            {user && (
              <div className="relative">
                <button
                  type="button"
                  ref={mobileButtonRef}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsPopoverOpen((prev) => !prev);
                  }}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title={user.name}
                >
                  {firstLetter}
                </button>
                {isPopoverOpen && (
                  <div
                    ref={mobilePopoverRef}
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                          {firstLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        type="button"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleChangePasswordClick();
                        }}
                        className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors font-medium text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                        </svg>
                        Change Password
                      </button>
                    </div>

                    <div className="border-t border-gray-100 p-2">
                      <button
                        type="button"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleLogoutClick(event);
                        }}
                        disabled={isLoggingOut}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
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
            </div>
          </div>
        )}
      </header>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}
