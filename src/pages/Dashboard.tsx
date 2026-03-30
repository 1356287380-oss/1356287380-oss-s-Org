import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Customer, Journey } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [recentJourneys, setRecentJourneys] = useState<(Journey & { customers: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      // Fetch customers count
      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (customersData) setCustomers(customersData);

      // Fetch recent journeys
      const { data: journeysData } = await supabase
        .from('journeys')
        .select('*, customers(name)')
        .order('date', { ascending: false })
        .limit(5);

      if (journeysData) setRecentJourneys(journeysData as any);

      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                  <dd className="text-lg font-medium text-gray-900">{customers.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recent Interactions</dt>
                  <dd className="text-lg font-medium text-gray-900">{recentJourneys.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="bg-white shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Customers</h3>
            <Link to="/customers" className="text-sm text-indigo-600 hover:text-indigo-900">View all</Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <li key={customer.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <Link to={`/customers/${customer.id}`} className="block">
                  <p className="text-sm font-medium text-indigo-600 truncate">{customer.name}</p>
                  <p className="text-sm text-gray-500 truncate">{customer.company}</p>
                </Link>
              </li>
            ))}
            {customers.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">No customers yet.</li>
            )}
          </ul>
        </div>

        {/* Recent Journeys */}
        <div className="bg-white shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Journeys</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentJourneys.map((journey) => (
              <li key={journey.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {journey.customers?.name}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {journey.type}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {journey.notes}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <p>
                      {new Date(journey.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
            {recentJourneys.length === 0 && (
              <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">No journeys recorded yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
