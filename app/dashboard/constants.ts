export const DEFAULT_THREAD_TYPES = [
  "Cotton",
  "Polyester",
  "Silk",
  "Wool",
  "Nylon",
  "Linen",
];

export const THREAD_TYPE_ICONS: { [key: string]: string } = {
  Cotton: "🌾",
  Polyester: "🧵",
  Silk: "✨",
  Wool: "🐑",
  Nylon: "🔗",
  Linen: "📋",
};

export const AVAILABLE_COLORS = [
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Purple",
  "Pink",
  "Orange",
  "Black",
  "White",
  "Brown",
  "Gray",
  "Cyan",
  "Indigo",
  "Lime",
  "Teal",
];

export const COLOR_ICONS: { [key: string]: string } = {
  Red: "🔴",
  Blue: "🔵",
  Green: "🟢",
  Yellow: "🟡",
  Purple: "🟣",
  Pink: "💗",
  Orange: "🟠",
  Black: "⚫",
  White: "⚪",
  Brown: "🟤",
  Gray: "⭕",
  Cyan: "🔷",
  Indigo: "🔹",
  Lime: "💚",
  Teal: "🧿",
};

export const COLOR_MAP: { [key: string]: string } = {
  Red: "#EF4444",
  Blue: "#3B82F6",
  Green: "#10B981",
  Yellow: "#FBBF24",
  Purple: "#A855F7",
  Pink: "#EC4899",
  Orange: "#F97316",
  Black: "#1F2937",
  White: "#C7D2E0",
  Brown: "#92400E",
  Gray: "#6B7280",
  Cyan: "#06B6D4",
  Indigo: "#4F46E5",
  Lime: "#84CC16",
  Teal: "#14B8A6",
};

export const DATE_RANGE_OPTIONS = [
  { value: "last-month", label: "Last Month", days: 30 },
  { value: "last-3-months", label: "Last 3 Months", days: 90 },
  { value: "last-year", label: "Last Year", days: 365 },
  { value: "custom", label: "Custom Range" },
  { value: "all", label: "All Time" },
];
