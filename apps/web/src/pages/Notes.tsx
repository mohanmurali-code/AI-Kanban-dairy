function Notes() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Notes</h2>
      <textarea
        className="w-full min-h-64 resize-y rounded-md border bg-transparent p-3 outline-none"
        placeholder="Draft your thoughts…"
      />
    </div>
  )
}

export default Notes


