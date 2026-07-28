export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-8">
      <div className="w-full max-w-6xl bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Manage users, events, and approve pending accounts.
        </p>
        {/* Admin tables and stats go here */}
      </div>
    </div>
  )
}
