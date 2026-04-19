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

interface FabricCount {
  type: string;
  count: number;
}

const COLORS = [
  "rgba(99,102,241,0.85)",
  "rgba(251,191,36,0.85)",
  "rgba(16,185,129,0.85)",
  "rgba(239,68,68,0.85)",
  "rgba(236,72,153,0.85)",
  "rgba(20,184,166,0.85)",
  "rgba(249,115,22,0.85)",
];

export default function FabricCountBarChart({ data }: { data: FabricCount[] }) {
  if (data.length === 0) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-600">No fabric data</p>
        <p className="text-xs text-gray-400 mt-1">No records found for the selected period.</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.type),
    datasets: [
      {
        label: "Count (pcs)",
        data: data.map((d) => d.count),
        backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 40,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 16, left: 8, right: 8, bottom: 8 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e1b4b",
        titleColor: "#a5b4fc",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${Number(ctx.parsed.y)} pcs`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: "bold" }, color: "#374151" },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        border: { display: false, dash: [4, 4] },
        ticks: {
          font: { size: 11 },
          color: "#9ca3af",
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
