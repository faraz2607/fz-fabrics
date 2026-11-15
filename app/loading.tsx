export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 backdrop-blur-sm">
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-4 shadow-lg">
        <span className="sr-only">Loading</span>
        <span aria-hidden="true" className="floating-loader-dot" />
        <span aria-hidden="true" className="floating-loader-dot" />
        <span aria-hidden="true" className="floating-loader-dot" />
      </div>
    </div>
  );
}
