"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";
import TableSkeleton from "@/app/components/TableSkeleton";

interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function MembersPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && user?.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/organizations/members");
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error("Failed to fetch organization members", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user?.role === "ADMIN") {
      fetchMembers();
    }
  }, [loading, router, user?.role]);

  if (loading || isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Organization Members</p>
            <h2 className="text-base font-semibold text-gray-900">{user.organizationName || "Your organization"}</h2>
          </div>
          <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {members.length} active users
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                {member.role}
              </span>
            </div>
          ))}

          {members.length === 0 && (
            <p className="text-sm text-gray-500">No members found yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
