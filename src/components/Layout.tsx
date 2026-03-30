import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, LayoutDashboard } from 'lucide-react';

export default function Layout() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Users className="h-6 w-6 text-indigo-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">CRM Pro</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link
            to="/"
            className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-900 hover:bg-gray-50 hover:text-indigo-600"
          >
            <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400" />
            Dashboard
          </Link>
          <Link
            to="/customers"
            className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-900 hover:bg-gray-50 hover:text-indigo-600"
          >
            <Users className="mr-3 h-5 w-5 text-gray-400" />
            Customers
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-700">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate w-40">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
