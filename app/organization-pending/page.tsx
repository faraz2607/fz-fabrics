"use client";

import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useEffect, useState } from "react";

export default function OrganizationPendingPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role === "SUPER_ADMIN" || user.organizationActive !== false)) {
      router.replace(user ? "/dashboard" : "/auth/login");
    }
  }, [loading, user, router]);

  const logout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/auth/login");
  };

  if (loading) return <div className="mx-auto mt-12 max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">Checking organization status…</div>;
  if (!user || user.role === "SUPER_ADMIN" || user.organizationActive !== false) return null;

  const isUnassigned = !user.organizationId;
  const isInactive = user.organizationStatus === "INACTIVE";

  return (
    <main className="mx-auto mt-8 max-w-lg rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 3.8c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3Z" />
        </svg>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Organization access</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">{isUnassigned ? "You haven’t been assigned to an organization yet" : isInactive ? "Organization access is inactive" : "Your organization is awaiting activation"}</h1>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        {isUnassigned ? "Your account is ready, but it needs to be mapped to an organization before you can access the workspace. Please contact your platform administrator." : user?.organizationName ? <><span className="font-semibold text-gray-800">{user.organizationName}</span> {isInactive ? "has been deactivated. Workspace access is paused." : "is awaiting activation. You’ll be able to access the workspace once a platform administrator approves it."}</> : isInactive ? "Your organization has been deactivated. Workspace access is paused." : "Your organization is awaiting activation by a platform administrator."}
      </p>
      {!isUnassigned && <p className="mt-2 text-sm text-gray-600">{isInactive ? "Please contact the platform administrator if you need access restored." : "If you believe this is unexpected, please contact the platform administrator."}</p>}
      <button onClick={logout} disabled={isLoggingOut} className="mt-6 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-50">
        {isLoggingOut ? "Signing out…" : "Sign out"}
      </button>
    </main>
  );
}
