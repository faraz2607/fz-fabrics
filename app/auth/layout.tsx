import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <Link href="/auth/login" className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight text-blue-900" aria-label="FabriTrack home">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-lg font-extrabold text-white">F</span>
        FabriTrack
      </Link>
      {children}
    </div>
  );
}
