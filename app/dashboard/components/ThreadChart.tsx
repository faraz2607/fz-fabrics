"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Thread } from "../page";
import { COLOR_MAP } from "../constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ThreadChart({ threads }: { threads: Thread[] }) {
  if (threads.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No threads added yet. Add a thread to see the chart.</p>
      </div>
    );
  }

  // Sort threads by date
  const sortedThreads = [...threads].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get unique dates and colors
  const uniqueDates = [...new Set(sortedThreads.map(t => new Date(t.date).toLocaleDateString()))];
  const uniqueColors = [...new Set(sortedThreads.map(t => t.color))];

  // Create datasets for each color
  const datasets = uniqueColors.map((color) => {
    const colorThreads = sortedThreads.filter(t => t.color === color);
    const data = uniqueDates.map(date => {
      const thread = colorThreads.find(t => new Date(t.date).toLocaleDateString() === date);
      return thread ? thread.cost : null;
    });

    return {
      label: color,
      data: data,
      borderColor: COLOR_MAP[color] || "#" + Math.floor(Math.random() * 16777215).toString(16),
      backgroundColor: `${COLOR_MAP[color] || "#000"}20`,
      borderWidth: 2.5,
      fill: false,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: COLOR_MAP[color] || "#000",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointHoverRadius: 8,
      spanGaps: true,
    };
  });

  const chartData = {
    labels: uniqueDates,
    datasets: datasets,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: "bold" as const,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `₹${Number(context.parsed.y).toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "₹" + value.toFixed(2);
          },
        },
      },
      x: {
      },
    },
  };

  return (
    <div className="w-full h-96 bg-gray-50 rounded-lg border border-gray-200 p-4">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
