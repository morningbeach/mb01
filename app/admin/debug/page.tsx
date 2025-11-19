// app/admin/debug/page.tsx

export default function AdminDebugPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Debug Page
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          如果你看得到這段文字，代表 <code>/admin/debug</code> 的 GET 正常。
        </p>
      </div>
    </main>
  );
}
