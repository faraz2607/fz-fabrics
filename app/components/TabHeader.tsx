"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import ChangePasswordModal from "@/app/components/ChangePasswordModal";
import Modal from "@/app/components/Modal";

type Tab = { href: string; label: string };

const baseTabs: Tab[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employee", label: "Employee" },
  { href: "/thread", label: "Thread" },
  // { href: "/bill", label: "Bill" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refetch } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isOrganizationModalOpen, setIsOrganizationModalOpen] = useState(false);
  const [organizationNameDraft, setOrganizationNameDraft] = useState("");
  const [isSavingOrganization, setIsSavingOrganization] = useState(false);
  const [organizationError, setOrganizationError] = useState("");
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [inviteUrlShared, setInviteUrlShared] = useState(false);
  const [organizationSignupUrl, setOrganizationSignupUrl] = useState("");
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

  const handleCopyInviteCode = async () => {
    if (!user?.organizationInviteCode) return;
    try {
      await navigator.clipboard.writeText(user.organizationInviteCode);
      setInviteCodeCopied(true);
      window.setTimeout(() => setInviteCodeCopied(false), 2000);
    } catch (error) {
      console.error("Could not copy organization invite code:", error);
      setInviteCodeCopied(false);
    }
  };

  const handleEditOrganizationClick = () => {
    setOrganizationNameDraft(user?.organizationName || "");
    setOrganizationError("");
    setInviteUrlShared(false);
    setOrganizationSignupUrl(user?.organizationInviteCode
      ? `${window.location.origin}/auth/signup?inviteCode=${encodeURIComponent(user.organizationInviteCode)}`
      : "");
    setIsOrganizationModalOpen(true);
    setIsPopoverOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleShareOrganizationSignupUrl = async () => {
    if (!organizationSignupUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join ${user?.organizationName || "our organization"} on FabriTrack`,
          text: "Create your FabriTrack account and join our organization.",
          url: organizationSignupUrl,
        });
      } else {
        await navigator.clipboard.writeText(organizationSignupUrl);
      }
      setInviteUrlShared(true);
      window.setTimeout(() => setInviteUrlShared(false), 2500);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(organizationSignupUrl);
        setInviteUrlShared(true);
        window.setTimeout(() => setInviteUrlShared(false), 2500);
      } catch (copyError) {
        console.error("Could not share organization signup URL:", copyError);
      }
    }
  };

  const handleOrganizationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingOrganization(true);
    setOrganizationError("");
    try {
      const response = await fetch("/api/organizations/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: organizationNameDraft }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update organization");
      setIsOrganizationModalOpen(false);
      refetch();
    } catch (error) {
      setOrganizationError(error instanceof Error ? error.message : "Could not update organization");
    } finally {
      setIsSavingOrganization(false);
    }
  };

  const firstLetter = user?.name.charAt(0).toUpperCase();
  const organizationIsActive = user?.organizationActive === true;
  const tabs: Tab[] = [
    ...baseTabs,
    ...(user?.role === "ADMIN" ? [{ href: "/members", label: "Members" }] : []),
    ...(user?.role === "SUPER_ADMIN" ? [{ href: "/users", label: "Users" }] : []),
  ];

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <header className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="w-full flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
          <div className="truncate text-base sm:text-lg font-bold text-black">
            {user?.organizationName || "Organization"}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            {organizationIsActive && <div className="flex space-x-1">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      isActive ? "bg-blue-700 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-black"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>}
     
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
                    className="absolute right-0 mt-2 w-[min(20rem,calc(100vw_-_1.5rem))] bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                          {firstLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="min-w-0 truncate text-sm font-semibold text-gray-900 sm:text-base">{user.name}</p>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${user.role === "SUPER_ADMIN" ? "bg-green-100 text-green-800" : user.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                              {(user.role || "USER").replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {user.role === "ADMIN" && (
                        <button
                            type="button"
                            onClick={handleEditOrganizationClick}
                            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 2.651 2.651M4 20l4.548-.91L19.5 8.138a1.875 1.875 0 0 0-2.652-2.652L5.895 16.44 4 20Z" />
                            </svg>
                            Edit Organization
                          </button>
                      )}
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
            {organizationIsActive && <button
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
            </button>}
            
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
                    className="absolute right-0 mt-2 w-[min(20rem,calc(100vw_-_1.5rem))] bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                          {firstLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="min-w-0 truncate text-sm font-semibold text-gray-900 sm:text-base">{user.name}</p>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${user.role === "SUPER_ADMIN" ? "bg-green-100 text-green-800" : user.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                              {(user.role || "USER").replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {user.role === "ADMIN" && (
                        <button
                            type="button"
                            onClick={handleEditOrganizationClick}
                            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 2.651 2.651M4 20l4.548-.91L19.5 8.138a1.875 1.875 0 0 0-2.652-2.652L5.895 16.44 4 20Z" />
                            </svg>
                            Edit Organization
                          </button>
                      )}
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
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && organizationIsActive && (
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

      <Modal isOpen={isOrganizationModalOpen} onClose={() => setIsOrganizationModalOpen(false)} title="Edit Organization">
        <form onSubmit={handleOrganizationSubmit} className="space-y-4">
          <div>
            <label htmlFor="organization-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-700">Organization name</label>
            <input
              id="organization-name"
              value={organizationNameDraft}
              onChange={(event) => setOrganizationNameDraft(event.target.value)}
              maxLength={100}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {user?.organizationInviteCode && <div>
            <label htmlFor="organization-invite-code" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-700">Organization invite code</label>
            <div className="flex gap-2">
              <input id="organization-invite-code" value={user.organizationInviteCode} readOnly disabled className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 font-mono text-sm font-semibold tracking-wider text-gray-700 disabled:cursor-not-allowed" />
              <button type="button" onClick={handleCopyInviteCode} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{inviteCodeCopied ? "Copied" : "Copy"}</button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Share this code so teammates can join your organization during signup.</p>
            <label htmlFor="organization-signup-url" className="mb-1 mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-700">Signup URL</label>
            <div className="flex items-stretch gap-2">
              <textarea id="organization-signup-url" value={organizationSignupUrl} readOnly rows={2} className="min-w-0 flex-1 resize-none break-all rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-700" />
              <button type="button" onClick={handleShareOrganizationSignupUrl} className="shrink-0 self-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{inviteUrlShared ? "Shared" : "Share URL"}</button>
            </div>
          </div>}
          {organizationError && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{organizationError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsOrganizationModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSavingOrganization} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{isSavingOrganization ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
