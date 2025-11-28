// app/admin/login/page.tsx
export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const hasError = searchParams.error === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <form
        method="POST"
        action="/api/admin/login"
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-md"
      >
        <h1 className="text-xl font-semibold text-zinc-900">Admin Login</h1>

        {hasError && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-600">
            Email 或密碼錯誤，請重試
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm text-zinc-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm text-zinc-700">Password</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Login
        </button>
      </form>
    </div>
  );
}
