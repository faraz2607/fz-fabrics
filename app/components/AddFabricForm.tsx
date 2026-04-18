import { useState, useEffect, useRef } from "react";

interface Fabric {
  type: string;
  cost: number;
  count: number;
  createdAt?: string;
}

interface FabricType {
  id?: string;
  type: string;
  cost: number;
}


interface AddFabricFormProps {
  onAdd: (fabric: Fabric) => void;
}


export default function AddFabricForm({ onAdd }: AddFabricFormProps) {
  const [type, setType] = useState("");
  const [cost, setCost] = useState("");
  const [count, setCount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fabricTypes, setFabricTypes] = useState<FabricType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch('/api/fabrics');
        if (res.ok) {
          setFabricTypes(await res.json());
        }
      } catch {}
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleTypeSelect = (selectedType: string) => {
    setType(selectedType);
    const found = fabricTypes.find(f => f.type === selectedType);
    setCost(found ? String(found.cost) : "");
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(cost);
    const countNum = parseInt(count);
    if (!type || isNaN(costNum) || costNum <= 0 || isNaN(countNum) || countNum <= 0) return;
    onAdd({ type, cost: costNum, count: countNum, createdAt: date ? new Date(date).toISOString() : undefined });
    setType("");
    setCost("");
    setCount("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fabric Type</label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-2.5 rounded-xl border bg-white text-gray-900 text-sm font-medium transition-all flex items-center justify-between ${
              isOpen
                ? "border-indigo-400 ring-2 ring-indigo-200 shadow-md"
                : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
            }`}
          >
            <span className={type ? "text-gray-900" : "text-gray-400"}>
              {type || "Select fabric type"}
            </span>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-indigo-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-60 overflow-y-auto">
                {fabricTypes.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="font-medium">No fabric types available</p>
                    <p className="text-xs mt-1">Add fabric types first</p>
                  </div>
                ) : (
                  fabricTypes.map((f, index) => (
                    <button
                      key={f.type}
                      type="button"
                      onClick={() => handleTypeSelect(f.type)}
                      className={`w-full px-4 py-3 text-left transition-all duration-150 ${
                        f.type === type
                          ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                          : "text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
                      } ${index !== fabricTypes.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{f.type}</div>
                          <div className={`text-xs mt-0.5 ${
                            f.type === type ? "text-blue-100" : "text-gray-500"
                          }`}>
                            ₹{f.cost.toFixed(2)} per piece
                          </div>
                        </div>
                        {f.type === type && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Cost (₹)</label>
        <input
          type="number"
          value={cost}
          onChange={e => setCost(e.target.value)}
          placeholder="Auto-filled from fabric type"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
          min={1}
          required
          readOnly={!!type}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Count</label>
        <input
          type="number"
          value={count}
          onChange={e => setCount(e.target.value)}
          placeholder="Enter count"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          min={1}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm transition"
      >
        Add Fabric
      </button>
    </form>
  );
}
