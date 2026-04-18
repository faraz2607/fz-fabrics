"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface EmployeeEarning {
  employeeId: string;
  employeeName: string;
  earning: number;
  count: number;
}

export default function EmployeeEarningsBarChart({ data }: { data: EmployeeEarning[] }) {
  const sorted = [...data].sort((a, b) => a.employeeName.localeCompare(b.employeeName));

  if (sorted.length === 0) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-600">No earnings data</p>
        <p className="text-xs text-gray-400 mt-1">No records found for the selected period.</p>
      </div>
    );
  }

  const chartData = {
    labels: sorted.map((e) => e.employeeName),
    datasets: [
      {
        label: "Earning (₹)",
        data: sorted.map((e) => e.earning),
        backgroundColor: "rgba(99, 102, 241, 0.85)",
        hoverBackgroundColor: "rgba(79, 70, 229, 1)",
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: "yEarning",
      },
      {
        label: "Count (pcs)",
        data: sorted.map((e) => e.count),
        backgroundColor: "rgba(251, 191, 36, 0.85)",
        hoverBackgroundColor: "rgba(245, 158, 11, 1)",
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: "yCount",
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 16, left: 8, right: 8, bottom: 8 } },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          borderRadius: 4,
          useBorderRadius: true,
          font: { size: 12 },
          color: "#374151",
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#1e1b4b",
        titleColor: "#a5b4fc",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) =>
            ctx.datasetIndex === 0
              ? ` ₹${Number(ctx.parsed.y).toFixed(2)}`
              : ` ${Number(ctx.parsed.y)} pcs`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: "bold" }, color: "#374151" },
        border: { display: false },
      },
      yEarning: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        border: { display: false, dash: [4, 4] },
        ticks: {
          font: { size: 11 },
          color: "#6366f1",
          callback: (v) => "₹" + Number(v).toFixed(0),
        },
      },
      yCount: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { size: 11 },
          color: "#f59e0b",
          callback: (v) => `${v} pcs`,
        },
      },
    },
  };

  return (
    <div className="w-full h-80">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
