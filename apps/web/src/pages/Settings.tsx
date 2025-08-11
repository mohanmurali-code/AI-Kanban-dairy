function Settings() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>
      <div className="rounded-md border p-3">
        <div className="text-sm opacity-80">Data folder</div>
        <div className="mt-2 flex items-center gap-2">
          <input className="w-full rounded-md border bg-transparent p-2" placeholder="Choose folder…" readOnly />
          <button className="rounded-md border px-3 py-2">Browse…</button>
        </div>
      </div>
    </div>
  )
}

export default Settings


