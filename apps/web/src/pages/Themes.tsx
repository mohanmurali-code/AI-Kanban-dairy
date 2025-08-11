/**
 * Themes page.
 *
 * Simple theme selection controls. Actual theming logic to be added.
 */
function Themes() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Themes</h2>
      <div className="flex gap-3">
        <button className="rounded-md border px-3 py-2">Light</button>
        <button className="rounded-md border px-3 py-2">Dark</button>
        <button className="rounded-md border px-3 py-2">System</button>
      </div>
    </div>
  )
}

export default Themes


