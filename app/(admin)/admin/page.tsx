export default function AdminDashboardPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage users, events, and approve pending accounts.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {/* Admin tables and stats go here */}
          <p className="text-gray-500 text-center py-12">Dashboard modules coming soon.</p>
        </div>
      </div>
    </div>
  )
}
