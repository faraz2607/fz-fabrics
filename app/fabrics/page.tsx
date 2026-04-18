"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../components/Modal";
import ConfirmationModal from "../components/ConfirmationModal";
import TableSkeleton from "../components/TableSkeleton";
import NoDataFound from "../components/NoDataFound";

interface FabricType {
  id: string;
  type: string;
  cost: number;
}

export default function FabricListPage() {
  const [fabrics, setFabrics] = useState<FabricType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editFabric, setEditFabric] = useState<FabricType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState({ type: "", cost: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const router = useRouter();

  const fetchFabrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fabrics");
      if (!res.ok) throw new Error("Failed to fetch fabrics");
      const data = await res.json();
      setFabrics(data.sort((a: FabricType, b: FabricType) => (b.id || '').localeCompare(a.id || '')));
    } catch {
      setError("Failed to fetch fabrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFabrics();
  }, []);

  const handleOpenAdd = () => {
    setForm({ type: "", cost: "" });
    setFormError(null);
    setEditFabric(null);
    setShowAddModal(true);
  };

  const handleEdit = (fabric: FabricType) => {
    setForm({ type: fabric.type, cost: fabric.cost.toString() });
    setEditFabric(fabric);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/fabrics/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchFabrics();
    } catch {
      setError("Failed to delete fabric type.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const type = form.type.trim();
    const cost = parseFloat(form.cost);
    if (!type || isNaN(cost) || cost <= 0) {
      setFormError("Type and cost are required and cost must be positive.");
      return;
    }
    try {
      let res;
      if (editFabric) {
        res = await fetch(`/api/fabrics/${editFabric.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, cost }),
        });
      } else {
        res = await fetch("/api/fabrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, cost }),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Failed to save fabric type.");
        return;
      }
      setShowAddModal(false);
      fetchFabrics();
    } catch {
      setFormError("Failed to save fabric type.");
    }
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
        <div
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
          onClick={() => router.push("/employee")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600 group-hover:text-blue-800 transition-colors"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-800 transition-colors">
            Manage Fabrics
          </h1>
        </div>
        <button
          className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          onClick={handleOpenAdd}
        >
          Add Fabric
        </button>
      </div>
      {error && (
        <div className="mb-3 sm:mb-4 text-red-600 text-xs sm:text-sm bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
          {error}
        </div>
      )}
      <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
        {loading ? (
          <TableSkeleton rows={4} cols={3} />
        ) : fabrics.length === 0 ? (
          <NoDataFound
            title="No fabric types yet"
            description="Add your first fabric type to get started."
            action={{ label: "Add Fabric", onClick: handleOpenAdd }}
          />
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-123">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-linear-to-r from-blue-50 to-gray-50">
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cost (₹)
                  </th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {fabrics.map((fabric, idx) => (
                  <tr
                    key={fabric.id}
                    className={`transition-colors hover:bg-blue-50 ${idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}`}
                  >
                    <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {fabric.type}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                      ₹{fabric.cost}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium space-x-2 sm:space-x-3">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                        onClick={() => handleEdit(fabric)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 font-medium"
                        onClick={() => setDeleteId(fabric.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Fabric"
        message="Are you sure you want to delete this fabric type? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editFabric ? "Edit Fabric" : "Add Fabric"}
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Fabric Type
            </label>
            <input
              type="text"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type:
                    e.target.value.charAt(0).toUpperCase() +
                    e.target.value.slice(1),
                }))
              }
              placeholder="e.g. Cotton"
              className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
              required
              disabled={!!editFabric}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Cost (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
              placeholder="Enter cost"
              className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              min={0.01}
              required
            />
          </div>
          {formError && (
            <div className="flex items-center gap-2 text-red-600 text-xs sm:text-sm bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
              {formError}
            </div>
          )}
          <div className="flex gap-2 sm:gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 text-gray-600 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm transition"
            >
              {editFabric ? "Update" : "Add"} Fabric
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
