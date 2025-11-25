export default function TestLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-10">
        <div className="h-40 rounded-2xl bg-slate-800 flex items-center justify-center text-xl font-semibold">
          HERO
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 rounded-2xl bg-slate-800 flex items-center justify-center">
            CARD 1
          </div>
          <div className="h-32 rounded-2xl bg-slate-800 flex items-center justify-center">
            CARD 2
          </div>
          <div className="h-32 rounded-2xl bg-slate-800 flex items-center justify-center">
            CARD 3
          </div>
        </div>
      </div>
    </div>
  );
}
