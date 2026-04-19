"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Dropdown from "../../components/Dropdown";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import AddFabricForm from "../../components/AddFabricForm";
import Modal from "../../components/Modal";
import TableSkeleton from "../../components/TableSkeleton";
import NoDataFound from "../../components/NoDataFound";

interface Fabric {
  type: string;
  cost: number;
  count: number;
  earning?: number;
  createdAt?: string;
}

interface Payment {
  id: string;
  amount: number;
  totalEarning: number;
  donation: number;
  balance: number;
  note?: string;
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  donation?: number;
  createdAt: string;
  updatedAt: string;
}

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    donation: "0",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [showAddFabric, setShowAddFabric] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);

  // Pay modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payInput, setPayInput] = useState("");
  const [payNote, setPayNote] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Filter state
  const [filterType, setFilterType] = useState("current");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [weekStart, setWeekStart] = useState("1");

  // Transaction filter state
  const [transactionFilterType, setTransactionFilterType] = useState("4week");
  const [transactionCustomRange, setTransactionCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showTransactionCustomPicker, setShowTransactionCustomPicker] = useState(false);

  function getWeekRange(date = new Date(), startDay = 1) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day < startDay ? 7 : 0) + day - startDay;
    const weekStartDate = new Date(d);
    weekStartDate.setDate(d.getDate() - diff);
    weekStartDate.setHours(0, 0, 0, 0);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);
    return [weekStartDate, weekEndDate];
  }

  useEffect(() => {
    if (!employee) return;
    const fetchFabrics = async () => {
      let startDate: Date | null = null,
        endDate: Date | null = null;
      const now = new Date();
      if (filterType === "current") {
        [startDate, endDate] = getWeekRange(now, parseInt(weekStart));
      } else if (filterType === "last") {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        [startDate, endDate] = getWeekRange(lastWeek, parseInt(weekStart));
      } else if (filterType === "4week") {
        [startDate, endDate] = getWeekRange(now, parseInt(weekStart));
        if (startDate) startDate.setDate(startDate.getDate() - 7 * 3);
      } else if (
        filterType === "custom" &&
        customRange.startDate &&
        customRange.endDate
      ) {
        startDate = new Date(customRange.startDate);
        endDate = new Date(customRange.endDate);
        endDate.setHours(23, 59, 59, 999);
      }
      let url = `/api/employees/${employee.id}/fabrics`;
      if (startDate && endDate) {
        url += `?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
      }
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setFabrics(data.sort((a: Fabric, b: Fabric) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
        }
      } catch {}
    };
    fetchFabrics();
  }, [employee, filterType, customRange, weekStart]);

  useEffect(() => {
    if (!employee) return;
    const fetchPayments = async () => {
      let startDate: Date | null = null,
        endDate: Date | null = null;
      const now = new Date();
      if (transactionFilterType === "current") {
        [startDate, endDate] = getWeekRange(now, parseInt(weekStart));
      } else if (transactionFilterType === "last") {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        [startDate, endDate] = getWeekRange(lastWeek, parseInt(weekStart));
      } else if (transactionFilterType === "4week") {
        [startDate, endDate] = getWeekRange(now, parseInt(weekStart));
        if (startDate) startDate.setDate(startDate.getDate() - 7 * 3);
      } else if (
        transactionFilterType === "custom" &&
        transactionCustomRange.startDate &&
        transactionCustomRange.endDate
      ) {
        startDate = new Date(transactionCustomRange.startDate);
        endDate = new Date(transactionCustomRange.endDate);
        endDate.setHours(23, 59, 59, 999);
      }
      let url = `/api/employees/${employee.id}/payments`;
      if (startDate && endDate) {
        url += `?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
      }
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setPayments(data.sort((a: Payment, b: Payment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch {}
    };
    fetchPayments();
  }, [employee, transactionFilterType, transactionCustomRange, weekStart]);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/employees/${params.id}`);
        if (response.status === 401) {
          setUnauthorized(true);
          return;
        }
        if (!response.ok) {
          setError(
            response.status === 404
              ? "Employee not found"
              : "Failed to fetch employee",
          );
          return;
        }
        setEmployee(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchEmployee();
  }, [params.id]);

  useEffect(() => {
    if (unauthorized) router.replace("/auth/login");
  }, [unauthorized, router]);

  const totalEarning = fabrics.reduce((sum, f) => sum + (f.earning ?? 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDonation = payments.reduce((sum, p) => sum + (p.donation || 0), 0);
  const totalBalance = payments.reduce((sum, p) => sum + p.balance, 0);

  const payAmount = parseFloat(payInput) || 0;
  const donationAmount = employee?.donation || 0;
  const earningAfterDonation = totalEarning > 0 ? totalEarning - donationAmount : 0;
  const balanceAfterPay = totalEarning > 0 ? earningAfterDonation - payAmount : -payAmount;

  const handlePay = async () => {
    if (!employee || payAmount <= 0) return;
    
    // Require note when total earning is 0 and paying extra
    if (totalEarning === 0 && payAmount > 0 && !payNote.trim()) {
      setPayError("Note is required when paying advance (earning is 0).");
      return;
    }
    
    setPayLoading(true);
    try {
      const res = await fetch(`/api/employees/${employee.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payAmount,
          totalEarning,
          donation: totalEarning > 0 ? (employee.donation || 0) : 0,
          note: payNote,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setPayments((prev) => [saved, ...prev]);
        setShowPayModal(false);
        setPayInput("");
        setPayNote("");
        setPayError(null);
      } else {
        setPayError("Failed to record payment. Please try again.");
      }
    } catch {
      setPayError("Failed to record payment. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          donation: parseFloat(editForm.donation) || 0,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployee(updated);
        setShowEditModal(false);
      } else {
        const data = await res.json();
        setEditError(data.error || "Failed to update employee");
      }
    } catch {
      setEditError("An error occurred");
    } finally {
      setEditSubmitting(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading)
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
        <TableSkeleton rows={6} cols={4} />
      </div>
    );

  if (error)
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6 text-center py-12">
        <p className="text-gray-500 mb-4 text-xs sm:text-sm">{error}</p>
        <Link
          href="/employee"
          className="inline-flex items-center rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
        >
          Back to Employees
        </Link>
      </div>
    );

  if (!employee) return null;

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 -ml-1">
            <div
              className="flex items-center gap-1.5 cursor-pointer group"
              onClick={() => router.push("/employee")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:text-blue-800 transition-colors shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black group-hover:text-blue-800 transition-colors truncate">
                {employee.name}
              </h1>
            </div>
            <button
              onClick={() => {
                setEditForm({
                  name: employee.name,
                  email: employee.email,
                  phone: employee.phone || "",
                  donation: employee.donation?.toString() || "0",
                });
                setEditError(null);
                setShowEditModal(true);
              }}
              title="Edit Employee"
              className="text-gray-400 hover:text-blue-600 transition-colors shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 wrap-break-word">
            {employee.email}
          </p>
          <p className="text-gray-600 text-xs sm:text-sm wrap-break-word">
            +91{employee.phone || "Not provided"} | Donation: ₹{employee.donation?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="text-right shrink-0 text-xs sm:text-sm">
          <p className="text-gray-500">ID: {employee.id.slice(0, 8)}...</p>
          <p className="text-gray-500 mt-0.5">
            Joined: {formatDate(employee.createdAt)}
          </p>
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Total earning card */}
        <div className="bg-linear-to-br from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-green-200 flex flex-col gap-2">
          <div className="text-xs sm:text-sm font-semibold text-green-600 uppercase tracking-wider">
            Total Earning
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-900">
            ₹{totalEarning.toFixed(2)}
          </div>
          <div className="text-xs sm:text-sm text-green-600">
            {fabrics.reduce((s, f) => s + f.count, 0)} pcs total
          </div>
        </div>
        {/* Per-type cards */}
        {Object.entries(
          fabrics.reduce(
            (acc, f) => {
              if (!acc[f.type]) acc[f.type] = { earning: 0, count: 0 };
              acc[f.type].earning += f.earning ?? 0;
              acc[f.type].count += f.count;
              return acc;
            },
            {} as Record<string, { earning: number; count: number }>,
          ),
        ).map(([type, data]) => (
          <div
            key={type}
            className="bg-linear-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200 flex flex-col gap-2"
          >
            <div className="text-xs sm:text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {type}
            </div>
            <div className="text-lg sm:text-xl font-bold text-blue-900">
              ₹{data.earning.toFixed(2)}
            </div>
            <div className="text-xs sm:text-sm text-blue-500">{data.count} pcs</div>
          </div>
        ))}
      </div>

      {/* Add Fabric + Filters */}
      <div className="mt-4 sm:mt-6">
        <div className="flex flex-wrap items-end gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="relative">
            <Dropdown
              label=""
              value={filterType}
              onChange={(value) => {
                setFilterType(value);
                if (value === "custom") setShowCustomPicker(true);
                else setShowCustomPicker(false);
              }}
              options={[
                { value: "current", label: "Current Week" },
                { value: "last", label: "Last Week" },
                { value: "4week", label: "Last 4 Weeks" },
                { value: "custom", label: "Custom" },
              ]}
              minWidth="min-w-32 sm:min-w-40"
            />
            {filterType === "custom" && (
              <CustomDateRangePicker
                startDate={customRange.startDate}
                endDate={customRange.endDate}
                onStartDateChange={(date) =>
                  setCustomRange((r) => ({ ...r, startDate: date }))
                }
                onEndDateChange={(date) =>
                  setCustomRange((r) => ({ ...r, endDate: date }))
                }
                isOpen={showCustomPicker}
                onClose={() => setShowCustomPicker(false)}
                trigger={<div></div>}
              />
            )}
          </div>
          <Dropdown
            label=""
            value={weekStart}
            onChange={setWeekStart}
            options={[
              { value: "1", label: "Monday" },
              { value: "6", label: "Saturday" },
              { value: "0", label: "Sunday" },
              { value: "5", label: "Friday" },
              { value: "2", label: "Tuesday" },
              { value: "3", label: "Wednesday" },
              { value: "4", label: "Thursday" },
            ]}
            minWidth="min-w-32 sm:min-w-40"
          />
        </div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 className="text-sm sm:text-base font-semibold">Fabrics</h2>
          <button
            className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            onClick={() => setShowAddFabric(true)}
          >
            Add Fabric
          </button>
        </div>
      </div>
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Employee"
      >
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  name:
                    e.target.value.charAt(0).toUpperCase() +
                    e.target.value.slice(1),
                }))
              }
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Phone{" "}
              <span className="normal-case font-normal text-gray-400">
                (Optional)
              </span>
            </label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, phone: e.target.value }))
              }
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Donation (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editForm.donation}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, donation: e.target.value }))
              }
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              placeholder="Enter donation amount"
            />
          </div>
          {editError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
              {editError}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editSubmitting}
              className="flex-1 px-3 py-1.5 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm transition disabled:opacity-50"
            >
              {editSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showAddFabric}
        onClose={() => setShowAddFabric(false)}
        title="Add Fabric"
      >
        <AddFabricForm
          onAdd={async (fabric: Fabric) => {
            try {
              if (!employee) throw new Error();
              const res = await fetch(`/api/employees/${employee.id}/fabrics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fabric),
              });
              if (res.ok) {
                const saved = await res.json();
                setFabrics((prev) => [...prev, saved]);
                setShowAddFabric(false);
              }
            } catch {}
          }}
        />
      </Modal>

      <Modal
        isOpen={showPayModal}
        onClose={() => {
          setShowPayModal(false);
          setPayError(null);
        }}
        title="Record Payment"
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
            <span>Current Period Earning:</span>
            <span className="font-bold text-gray-900">₹{totalEarning.toFixed(2)}</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Total Earning (this period)
            </label>
            <input
              type="number"
              disabled
              value={totalEarning.toFixed(2)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-400 text-xs cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Amount to Pay
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount paid"
              value={payInput}
              onChange={(e) => {
                setPayInput(e.target.value);
                setPayError(null);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>
          {payInput !== "" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Balance Left
              </label>
              <input
                type="number"
                disabled
                value={balanceAfterPay.toFixed(2)}
                className={`w-full px-3 py-1.5 rounded-lg border bg-gray-100 text-xs cursor-not-allowed font-semibold ${
                  balanceAfterPay >= 0
                    ? "text-red-600 border-red-200"
                    : "text-yellow-600 border-yellow-200"
                }`}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Note{" "}
              {totalEarning === 0 && (
                <span className="text-red-500">*</span>
              )}
              {totalEarning > 0 && (
                <span className="normal-case font-normal text-gray-400">
                  (Optional)
                </span>
              )}
            </label>
            <input
              type="text"
              placeholder={totalEarning === 0 ? "Required: e.g. Advance payment" : "e.g. Weekly salary"}
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              required={totalEarning === 0}
            />
          </div>
          {payError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
              {payError}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setShowPayModal(false);
                setPayError(null);
              }}
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePay}
              disabled={payLoading || payAmount <= 0}
              className="flex-1 px-3 py-1.5 rounded-lg bg-linear-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold hover:from-green-700 hover:to-emerald-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {payLoading ? "Saving..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Fabrics Table */}
      <div className="mt-3 sm:mt-4">
        {fabrics.length === 0 ? (
          <NoDataFound
            title="No fabrics added yet"
            description="Add fabrics for this employee using the button above."
          />
        ) : (
          <div className="overflow-x-auto max-h-150 overflow-y-auto">
            {Object.entries(
              fabrics.reduce(
                (acc, fabric) => {
                  const date = fabric.createdAt
                    ? new Date(fabric.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown Date";
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(fabric);
                  return acc;
                },
                {} as Record<string, typeof fabrics>,
              ),
            ).map(([date, group]) => (
              <div key={date} className="mb-4 sm:mb-6">
                <div className="font-bold text-blue-700 mb-2 text-xs sm:text-sm bg-white py-1">
                  Added on: {date}
                </div>
                <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-linear-to-r from-blue-50 to-gray-50">
                      <tr>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Cost (₹)
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Earning
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {group.map((fabric, idx) => (
                        <tr
                          key={idx}
                          className={`transition-colors hover:bg-blue-50 ${idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}`}
                        >
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            {fabric.type}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                            ₹{fabric.cost}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                            {fabric.count}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                            ₹{(fabric.earning ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History Table */}
      <div className="mt-4 sm:mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
          <h2 className="text-sm sm:text-base font-semibold">Transaction History</h2>
          <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            <div className="relative">
              <Dropdown
                label=""
                value={transactionFilterType}
                onChange={(value) => {
                  setTransactionFilterType(value);
                  if (value === "custom") setShowTransactionCustomPicker(true);
                  else setShowTransactionCustomPicker(false);
                }}
                options={[
                  { value: "current", label: "Current Week" },
                  { value: "last", label: "Last Week" },
                  { value: "4week", label: "Last 4 Weeks" },
                  { value: "custom", label: "Custom" },
                ]}
                minWidth="min-w-32 sm:min-w-40"
              />
              {transactionFilterType === "custom" && (
                <CustomDateRangePicker
                  startDate={transactionCustomRange.startDate}
                  endDate={transactionCustomRange.endDate}
                  onStartDateChange={(date) =>
                    setTransactionCustomRange((r) => ({ ...r, startDate: date }))
                  }
                  onEndDateChange={(date) =>
                    setTransactionCustomRange((r) => ({ ...r, endDate: date }))
                  }
                  isOpen={showTransactionCustomPicker}
                  onClose={() => setShowTransactionCustomPicker(false)}
                  trigger={<div></div>}
                />
              )}
            </div>
            <button
              onClick={() => {
                setPayInput("");
                setPayNote("");
                setShowPayModal(true);
              }}
              className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-green-700"
            >
              Pay Amount
            </button>
          </div>
        </div>
        {payments.length === 0 ? (
          <NoDataFound
            title="No transactions yet"
            description="Record a payment using the Pay Amount button above."
          />
        ) : (
          <div className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto overflow-y-auto max-h-112">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-linear-to-r from-blue-50 to-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Total Earning
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Donation
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Paid Amount
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Balance Left
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {payments.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`transition-colors hover:bg-blue-50 ${idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}`}
                    >
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        ₹{p.totalEarning.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-orange-600">
                        ₹{(p.donation || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-green-600">
                        ₹{p.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-red-600">
                        ₹{p.balance.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {p.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-linear-to-r from-blue-50 to-gray-50 border-t-2 border-gray-200 sticky bottom-0">
                  <tr>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold text-gray-700">
                      Total
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold text-gray-900">
                      ₹
                      {payments
                        .reduce((s, p) => s + p.totalEarning, 0)
                        .toFixed(2)}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold text-orange-600">
                      ₹{totalDonation.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold text-green-600">
                      ₹{totalPaid.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold text-red-600">
                      ₹{totalBalance.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
