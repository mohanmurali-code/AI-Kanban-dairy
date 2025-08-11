function Tasks() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tasks</h2>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Priority</th>
              <th className="px-3 py-2 text-left">Due</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2">Example task</td>
              <td className="px-3 py-2">In Progress</td>
              <td className="px-3 py-2">Medium</td>
              <td className="px-3 py-2">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Tasks


