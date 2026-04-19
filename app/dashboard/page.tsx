"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import Dropdown from "@/app/components/Dropdown";
import CustomDateRangePicker from "@/app/components/CustomDateRangePicker";
import ThreadChart from "./components/ThreadChart";
import EmployeeEarningsBarChart from "./components/EmployeeEarningsBarChart";
import FabricCountBarChart from "./components/FabricCountBarChart";
import { DEFAULT_THREAD_TYPES, DATE_RANGE_OPTIONS } from "./constants";
import TableSkeleton from "@/app/components/TableSkeleton";

interface Thread {
  id: string;
  type: string;
  color: string;
  cost: number;
  date: string;
}

interface EmployeeEarning {
  employeeId: string;
  employeeName: string;
  earning: number;
  count: number;
}

export default function DashboardPage() {
  const { user, loading } = useCurrentUser();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [earnings, setEarnings] = useState<EmployeeEarning[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(false);

  interface FabricCount { type: string; count: number; }
  const [fabricCounts, setFabricCounts] = useState<FabricCount[]>([]);
  const [fabricCountsLoading, setFabricCountsLoading] = useState(false);

  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("last-month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  const getCurrentWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    return {
      start: monday.toISOString().slice(0, 10) + 'T00:00:00.000Z',
      end: today.toISOString().slice(0, 10) + 'T23:59:59.999Z',
    };
  };
  const currentWeek = getCurrentWeekRange();

  const [earningsDateRange, setEarningsDateRange] = useState<string>("current");
  const [earningsStart, setEarningsStart] = useState<string>(currentWeek.start);
  const [earningsEnd, setEarningsEnd] = useState<string>(currentWeek.end);
  const [earningsCustomRange, setEarningsCustomRange] = useState({ startDate: "", endDate: "" });
  const [showEarningsCustomPicker, setShowEarningsCustomPicker] = useState(false);

  const [fabricCountsDateRange, setFabricCountsDateRange] = useState<string>("current");
  const [fabricCountsStart, setFabricCountsStart] = useState<string>(currentWeek.start);
  const [fabricCountsEnd, setFabricCountsEnd] = useState<string>(currentWeek.end);
  const [fabricCountsCustomRange, setFabricCountsCustomRange] = useState({ startDate: "", endDate: "" });
  const [showFabricCountsCustomPicker, setShowFabricCountsCustomPicker] = useState(false);

  const fetchEarnings = async (start: string, end: string) => {
    setEarningsLoading(true);
    try {
      const res = await fetch(`/api/employee-earnings?start=${start}&end=${end}`);
      if (res.ok) setEarnings(await res.json());
    } catch { setEarnings([]); } finally { setEarningsLoading(false); }
  };

  const fetchFabricCounts = async (start: string, end: string) => {
    setFabricCountsLoading(true);
    try {
      const res = await fetch(`/api/fabric-counts?start=${start}&end=${end}`);
      if (res.ok) setFabricCounts(await res.json());
    } catch { setFabricCounts([]); } finally { setFabricCountsLoading(false); }
  };

  const handleFabricCountsFilter = (type: string, start?: string, end?: string) => {
    setFabricCountsDateRange(type);
    const today = new Date();
    if (type === "current") {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      setFabricCountsStart(monday.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setFabricCountsEnd(today.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowFabricCountsCustomPicker(false);
    } else if (type === "last") {
      const dayOfWeek = today.getDay();
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      setFabricCountsStart(lastMonday.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setFabricCountsEnd(lastSunday.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowFabricCountsCustomPicker(false);
    } else if (type === "4week") {
      const fourWeeksAgo = new Date(today);
      fourWeeksAgo.setDate(today.getDate() - 27);
      setFabricCountsStart(fourWeeksAgo.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setFabricCountsEnd(today.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowFabricCountsCustomPicker(false);
    } else if (type === "custom" && start && end) {
      setFabricCountsStart(start);
      setFabricCountsEnd(end);
      setShowFabricCountsCustomPicker(false);
    } else if (type === "custom") {
      setShowFabricCountsCustomPicker(true);
    }
  };

  useEffect(() => {
    if (earningsStart && earningsEnd) fetchEarnings(earningsStart, earningsEnd);
  }, [earningsStart, earningsEnd]);

  useEffect(() => {
    if (fabricCountsStart && fabricCountsEnd) fetchFabricCounts(fabricCountsStart, fabricCountsEnd);
  }, [fabricCountsStart, fabricCountsEnd]);

  const handleEarningsFilter = (type: string, start?: string, end?: string) => {
    setEarningsDateRange(type);
    const today = new Date();
    if (type === "current") {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      setEarningsStart(monday.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setEarningsEnd(today.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowEarningsCustomPicker(false);
    } else if (type === "last") {
      const dayOfWeek = today.getDay();
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      setEarningsStart(lastMonday.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setEarningsEnd(lastSunday.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowEarningsCustomPicker(false);
    } else if (type === "4week") {
      const fourWeeksAgo = new Date(today);
      fourWeeksAgo.setDate(today.getDate() - 27);
      setEarningsStart(fourWeeksAgo.toISOString().slice(0, 10) + 'T00:00:00.000Z');
      setEarningsEnd(today.toISOString().slice(0, 10) + 'T23:59:59.999Z');
      setShowEarningsCustomPicker(false);
    } else if (type === "custom" && start && end) {
      setEarningsStart(start);
      setEarningsEnd(end);
      setShowEarningsCustomPicker(false);
    } else if (type === "custom") {
      setShowEarningsCustomPicker(true);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchThreads();
    }
  }, [user?.id]);

  const fetchThreads = async () => {
    try {
      setIsLoadingThreads(true);
      const response = await fetch("/api/threads");
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setIsLoadingThreads(false);
    }
  };

  const getFilteredThreads = () => {
    let filteredThreads = threads;

    if (filterType !== "all") {
      filteredThreads = filteredThreads.filter(
        (thread) => thread.type === filterType,
      );
    }

    if (dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      if (dateRange === "custom") {
        if (customDateRange.startDate && customDateRange.endDate) {
          startDate = new Date(customDateRange.startDate);
          const endDate = new Date(customDateRange.endDate);
          filteredThreads = filteredThreads.filter((thread) => {
            const threadDate = new Date(thread.date);
            return threadDate >= startDate && threadDate <= endDate;
          });
        }
      } else {
        const option = DATE_RANGE_OPTIONS.find(
          (opt) => opt.value === dateRange,
        );
        if (option && option.days) {
          startDate = new Date(
            now.getTime() - option.days * 24 * 60 * 60 * 1000,
          );
          filteredThreads = filteredThreads.filter((thread) => {
            const threadDate = new Date(thread.date);
            return threadDate >= startDate;
          });
        }
      }
    }

    return filteredThreads;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 font-medium">Please log in to continue</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Thread Cost Trend Chart */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Thread Cost Trend</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Dropdown
              label=""
              value={filterType}
              onChange={setFilterType}
              options={[
                { value: "all", label: "All Types" },
                ...DEFAULT_THREAD_TYPES.map((type) => ({ value: type, label: type })),
              ]}
              minWidth="min-w-32 sm:min-w-40"
            />
            <div className="relative">
              <Dropdown
                label=""
                value={dateRange}
                onChange={(value) => {
                  setDateRange(value);
                  setShowCustomDatePicker(value === "custom");
                }}
                options={DATE_RANGE_OPTIONS}
                minWidth="min-w-32 sm:min-w-40"
              />
              {dateRange === "custom" && (
                <CustomDateRangePicker
                  startDate={customDateRange.startDate}
                  endDate={customDateRange.endDate}
                  onStartDateChange={(date) => setCustomDateRange((prev) => ({ ...prev, startDate: date }))}
                  onEndDateChange={(date) => setCustomDateRange((prev) => ({ ...prev, endDate: date }))}
                  isOpen={showCustomDatePicker}
                  onClose={() => setShowCustomDatePicker(false)}
                  trigger={<div></div>}
                />
              )}
            </div>
          </div>
        </div>
        {isLoadingThreads ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <ThreadChart threads={getFilteredThreads()} />
        )}
      </div>

      {/* Row: Employee Earnings + Fabric Count */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Employee Earnings */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Employee Earnings</h3>
            <div className="relative">
              <Dropdown
                label=""
                value={earningsDateRange}
                onChange={(value) => {
                  setEarningsDateRange(value);
                  if (value === "custom") setShowEarningsCustomPicker(true);
                  else handleEarningsFilter(value);
                }}
                options={[
                  { value: "current", label: "Current Week" },
                  { value: "last", label: "Last Week" },
                  { value: "4week", label: "Last 4 Weeks" },
                  { value: "custom", label: "Custom" },
                ]}
                minWidth="min-w-32 sm:min-w-40"
              />
              {earningsDateRange === "custom" && (
                <CustomDateRangePicker
                  startDate={earningsCustomRange.startDate}
                  endDate={earningsCustomRange.endDate}
                  onStartDateChange={(date) => {
                    const updated = { ...earningsCustomRange, startDate: date };
                    setEarningsCustomRange(updated);
                    if (updated.startDate && updated.endDate)
                      handleEarningsFilter("custom", updated.startDate + 'T00:00:00.000Z', updated.endDate + 'T23:59:59.999Z');
                  }}
                  onEndDateChange={(date) => {
                    const updated = { ...earningsCustomRange, endDate: date };
                    setEarningsCustomRange(updated);
                    if (updated.startDate && updated.endDate)
                      handleEarningsFilter("custom", updated.startDate + 'T00:00:00.000Z', updated.endDate + 'T23:59:59.999Z');
                  }}
                  isOpen={showEarningsCustomPicker}
                  onClose={() => setShowEarningsCustomPicker(false)}
                  trigger={<div></div>}
                />
              )}
            </div>
          </div>
          {earningsLoading ? (
            <TableSkeleton rows={3} cols={3} />
          ) : (
            <EmployeeEarningsBarChart data={earnings} />
          )}
        </div>

        {/* Fabric Count by Type */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Fabric Count <span className="font-bold text-gray-900">- {fabricCounts.reduce((sum, f) => sum + f.count, 0)}</span>
            </h3>
            <div className="relative">
              <Dropdown
                label=""
                value={fabricCountsDateRange}
                onChange={(value) => {
                  setFabricCountsDateRange(value);
                  if (value === "custom") setShowFabricCountsCustomPicker(true);
                  else handleFabricCountsFilter(value);
                }}
                options={[
                  { value: "current", label: "Current Week" },
                  { value: "last", label: "Last Week" },
                  { value: "4week", label: "Last 4 Weeks" },
                  { value: "custom", label: "Custom" },
                ]}
                minWidth="min-w-32 sm:min-w-40"
              />
              {fabricCountsDateRange === "custom" && (
                <CustomDateRangePicker
                  startDate={fabricCountsCustomRange.startDate}
                  endDate={fabricCountsCustomRange.endDate}
                  onStartDateChange={(date) => {
                    const updated = { ...fabricCountsCustomRange, startDate: date };
                    setFabricCountsCustomRange(updated);
                    if (updated.startDate && updated.endDate)
                      handleFabricCountsFilter("custom", updated.startDate + 'T00:00:00.000Z', updated.endDate + 'T23:59:59.999Z');
                  }}
                  onEndDateChange={(date) => {
                    const updated = { ...fabricCountsCustomRange, endDate: date };
                    setFabricCountsCustomRange(updated);
                    if (updated.startDate && updated.endDate)
                      handleFabricCountsFilter("custom", updated.startDate + 'T00:00:00.000Z', updated.endDate + 'T23:59:59.999Z');
                  }}
                  isOpen={showFabricCountsCustomPicker}
                  onClose={() => setShowFabricCountsCustomPicker(false)}
                  trigger={<div></div>}
                />
              )}
            </div>
          </div>
          {fabricCountsLoading ? (
            <TableSkeleton rows={3} cols={3} />
          ) : (
            <FabricCountBarChart data={fabricCounts} />
          )}
        </div>

      </div>
    </div>
  );
}
