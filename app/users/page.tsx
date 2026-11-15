"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/useCurrentUser";
import Dropdown from "@/app/components/Dropdown";
import Modal from "@/app/components/Modal";
import ConfirmationModal from "@/app/components/ConfirmationModal";

type UserRow = { id: string; name: string; email: string; organizationId?: string; organizationName: string; organizationInviteCode?: string; organizationActive: boolean; organizationStatus: "PENDING" | "ACTIVE" | "INACTIVE"; role: string; active: boolean; passwordResetEnabled: boolean; createdAt: string };
type Organization = { id: string; name: string; isActive?: boolean | null; activatedAt?: string | null; label?: string };

const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

export default function UsersPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationOptions, setOrganizationOptions] = useState<Organization[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
  const [editName, setEditName] = useState("");
  const [editOrganizationId, setEditOrganizationId] = useState("");
  const [editRole, setEditRole] = useState("USER");
  const [editStatus, setEditStatus] = useState("active");
  const [editOrganizationStatus, setEditOrganizationStatus] = useState<"PENDING" | "ACTIVE" | "INACTIVE">("PENDING");
  const [editPasswordResetEnabled, setEditPasswordResetEnabled] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (search.trim()) query.set("search", search.trim());
      if (organizationId) query.set("organizationId", organizationId);
      if (activeFilter !== "all") query.set("active", activeFilter);
      const response = await fetch(`/api/users?${query}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load users");
      setRows(data.users);
      setOrganizations(data.organizations);
      setOrganizationOptions(data.organizationOptions);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, organizationId, activeFilter]);

  useEffect(() => {
    if (!loading && user?.role !== "SUPER_ADMIN") router.replace("/dashboard");
  }, [loading, user?.role, router]);

  useEffect(() => {
    if (loading || user?.role !== "SUPER_ADMIN") return;
    load().catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load users"));
  }, [loading, user?.role, load]);

  const openEdit = (row: UserRow) => {
    setEditingUser(row);
    setEditName(row.name);
    setEditOrganizationId(row.organizationId || "");
    setEditRole(row.role === "ADMIN" ? "ADMIN" : "USER");
    setEditStatus(row.active ? "active" : "inactive");
    setEditOrganizationStatus(row.organizationStatus);
    setEditPasswordResetEnabled(row.passwordResetEnabled);
    setError("");
  };

  const persistUser = async () => {
    if (!editingUser) return;
    setBusyId(editingUser.id);
    setError("");
    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          organizationId: editOrganizationId,
          name: editName,
          role: editRole,
          active: editStatus === "active",
          organizationStatus: editOrganizationStatus,
          passwordResetEnabled: editPasswordResetEnabled,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");
      setEditingUser(null);
      setShowChangeConfirmation(false);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Update failed");
    } finally {
      setBusyId("");
    }
  };

  const saveUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;
    const roleChanged = editRole !== editingUser.role;
    const statusChanged = (editStatus === "active") !== editingUser.active;
    const orgStatusChanged = editOrganizationStatus !== editingUser.organizationStatus;
    const resetChanged = editPasswordResetEnabled !== editingUser.passwordResetEnabled;
    if (roleChanged || statusChanged || orgStatusChanged || resetChanged) {
      setShowChangeConfirmation(true);
      return;
    }
    void persistUser();
  };

  const roleStatusChanges = editingUser ? [
    editRole !== editingUser.role ? `Role: ${editingUser.role.replace("_", " ")} → ${editRole.replace("_", " ")}` : "",
    (editStatus === "active") !== editingUser.active ? `Status: ${editingUser.active ? "Active" : "Inactive"} → ${editStatus === "active" ? "Active" : "Inactive"}` : "",
    editOrganizationStatus !== editingUser.organizationStatus ? `Organization: ${editingUser.organizationStatus} → ${editOrganizationStatus}` : "",
    editPasswordResetEnabled !== editingUser.passwordResetEnabled ? `Password reset: ${editingUser.passwordResetEnabled ? "Enabled" : "Disabled"} → ${editPasswordResetEnabled ? "Enabled" : "Disabled"}` : "",
  ].filter(Boolean).join("; ") : "";

  const deleteUser = async () => {
    if (!deletingUser) return;
    setBusyId(deletingUser.id);
    setDeleteError("");
    try {
      const response = await fetch(`/api/users?userId=${encodeURIComponent(deletingUser.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");
      setDeletingUser(null);
      if (rows.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "Delete failed");
    } finally {
      setBusyId("");
    }
  };

  if (loading || user?.role !== "SUPER_ADMIN") return <div className="p-8 text-center text-gray-500">Loading users…</div>;

  return <>
    <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Platform administration</p><h1 className="text-2xl font-bold text-gray-900">Users</h1></div>
        <p className="text-sm font-medium text-gray-700">{total} accounts</p>
      </div>
      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="user-search" className="block text-xs font-semibold uppercase tracking-wide text-gray-700">Search users</label>
          <input id="user-search" aria-label="Search users" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Name or email" className={inputClass} />
        </div>
        <Dropdown label="Organization" value={organizationId} onChange={(value) => { setOrganizationId(value); setPage(1); }} minWidth="w-full" options={[{ value: "", label: "All organizations" }, ...organizations.map((org) => ({ value: org.id, label: org.name }))]} />
        <Dropdown label="Status" value={activeFilter} onChange={(value) => { setActiveFilter(value); setPage(1); }} minWidth="w-full" options={[{ value: "all", label: "All statuses" }, { value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50"><tr>{["User name", "Email", "Organization", "Invite code", "Organization status", "Role", "Status", "Password reset", "Actions"].map((label) => <th key={label} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {!isLoading && rows.map((row) => {
              const roleColor = row.role === "SUPER_ADMIN" ? "border-green-200 bg-green-100 text-green-800" : row.role === "ADMIN" ? "border-red-200 bg-red-100 text-red-800" : "border-blue-200 bg-blue-100 text-blue-800";
              return <tr key={row.id}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{row.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{row.email}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{row.organizationName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{row.organizationInviteCode ? <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs font-semibold tracking-wider text-gray-900">{row.organizationInviteCode}</code> : <span className="text-gray-400">—</span>}</td>
                <td className="min-w-44 px-4 py-3">
                  {row.organizationId ? <div className="flex flex-col items-start gap-1.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.organizationStatus === "ACTIVE" ? "bg-green-100 text-green-800" : row.organizationStatus === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-gray-200 text-gray-700"}`}>{row.organizationStatus === "PENDING" ? "Pending activation" : row.organizationStatus === "ACTIVE" ? "Active" : "Inactive"}</span>
                  </div> : <span className="text-gray-500">No organization</span>}
                </td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${roleColor}`}>{row.role.replace("_", " ")}</span></td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>{row.active ? "Active" : "Inactive"}</span></td>
                <td className="min-w-36 px-4 py-3">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.passwordResetEnabled ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>{row.passwordResetEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {row.role === "SUPER_ADMIN" ? <span className="text-xs text-gray-500">Protected</span> : <div className="flex items-center gap-3">
                    <button disabled={busyId === row.id} onClick={() => openEdit(row)} className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 disabled:opacity-50">Edit</button>
                    <button disabled={busyId === row.id} onClick={() => { setDeleteError(""); setDeletingUser(row); }} className="text-sm font-semibold text-red-700 hover:text-red-900 disabled:opacity-50">Delete</button>
                  </div>}
                </td>
              </tr>;
            })}
            {isLoading ? <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-600">Loading users…</td></tr> : rows.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-600">No users match these filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-700">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-600">Previous</button>
          <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-600">Next</button>
        </div>
      </div>
    </section>

    <Modal isOpen={!!editingUser} onClose={() => { setEditingUser(null); setShowChangeConfirmation(false); }} title="Edit user" maxWidth="max-w-lg">
      <form onSubmit={saveUser} className="space-y-4">
        <div>
          <label htmlFor="edit-user-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-700">User name</label>
          <input id="edit-user-name" value={editName} onChange={(event) => setEditName(event.target.value)} required className={inputClass} />
        </div>
        <div>
          <Dropdown
            label="Map to organization"
            value={editOrganizationId}
            onChange={(value) => {
              setEditOrganizationId(value);
              const selected = organizationOptions.find((org) => org.id === value);
              if (selected) {
                setEditOrganizationStatus(selected.isActive !== false ? "ACTIVE" : selected.activatedAt ? "INACTIVE" : "PENDING");
              }
            }}
            minWidth="w-full"
            options={[{ value: "", label: "Select organization" }, ...organizationOptions.map((org) => ({ value: org.id, label: org.label || org.name }))]}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Dropdown label="Role" value={editRole} onChange={setEditRole} minWidth="w-full" options={[{ value: "ADMIN", label: "Admin" }, { value: "USER", label: "User" }]} />
          <Dropdown label="Status" value={editStatus} onChange={setEditStatus} minWidth="w-full" options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Dropdown label="Organization status" value={editOrganizationStatus} onChange={(value) => setEditOrganizationStatus(value as "PENDING" | "ACTIVE" | "INACTIVE")} minWidth="w-full" options={[{ value: "PENDING", label: "Pending activation" }, { value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]} />
          <Dropdown label="Password reset" value={editPasswordResetEnabled ? "enabled" : "disabled"} onChange={(value) => setEditPasswordResetEnabled(value === "enabled")} minWidth="w-full" options={[{ value: "disabled", label: "Disabled" }, { value: "enabled", label: "Enabled" }]} />
        </div>
        {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => setEditingUser(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={!editingUser || busyId === editingUser.id} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{busyId === editingUser?.id ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </Modal>

    <ConfirmationModal isOpen={showChangeConfirmation} onClose={() => setShowChangeConfirmation(false)} onConfirm={() => { setShowChangeConfirmation(false); void persistUser(); }} title="Confirm user changes" message={`Apply these changes for ${editingUser?.name}? ${roleStatusChanges}`} confirmText="Confirm changes" isLoading={!!editingUser && busyId === editingUser.id} type="warning" />
    <ConfirmationModal isOpen={!!deletingUser} onClose={() => { setDeletingUser(null); setDeleteError(""); }} onConfirm={deleteUser} title="Delete user" message={`Permanently delete ${deletingUser?.name} and their account data?`} confirmText="Delete user" isLoading={!!deletingUser && busyId === deletingUser.id} error={deleteError} />
  </>;
}
