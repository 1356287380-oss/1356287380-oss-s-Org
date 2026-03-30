import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Customer, Journey } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, Calendar, MapPin, Phone, Mail, Building, Trash2 } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [journeyDate, setJourneyDate] = useState(new Date().toISOString().split('T')[0]);
  const [journeyType, setJourneyType] = useState('Visit');
  const [journeyNotes, setJourneyNotes] = useState('');
  const [journeyNextSteps, setJourneyNextSteps] = useState('');

  useEffect(() => {
    if (!user || !id) return;
    fetchCustomerData();
  }, [user, id]);

  const fetchCustomerData = async () => {
    // Fetch customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
      
    if (customerError) {
      console.error(customerError);
      navigate('/customers');
      return;
    }
    setCustomer(customerData);

    // Fetch journeys
    const { data: journeysData } = await supabase
      .from('journeys')
      .select('*')
      .eq('customer_id', id)
      .order('date', { ascending: false });
      
    if (journeysData) setJourneys(journeysData);
    
    setLoading(false);
  };

  const handleCreateJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    const { data, error } = await supabase
      .from('journeys')
      .insert([
        { 
          customer_id: id, 
          user_id: user.id, 
          date: journeyDate, 
          type: journeyType, 
          notes: journeyNotes, 
          next_steps: journeyNextSteps 
        }
      ])
      .select();

    if (!error && data) {
      setJourneys([data[0], ...journeys].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsJourneyModalOpen(false);
      setJourneyNotes('');
      setJourneyNextSteps('');
      setJourneyDate(new Date().toISOString().split('T')[0]);
    } else {
      alert('Error creating journey: ' + error?.message);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!window.confirm('Are you sure you want to delete this customer? All associated journeys will also be deleted.')) return;
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
      
    if (!error) {
      navigate('/customers');
    } else {
      alert('Error deleting customer: ' + error.message);
    }
  };

  if (loading) return <div className="text-gray-500">Loading customer details...</div>;
  if (!customer) return <div className="text-gray-500">Customer not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm">
        <Link to="/customers" className="text-indigo-600 hover:text-indigo-900 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Customers
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h3 className="text-2xl leading-6 font-bold text-gray-900">{customer.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 flex items-center">
              <Building className="h-4 w-4 mr-1" /> {customer.company || 'No company specified'}
            </p>
          </div>
          <div className="flex space-x-2">
             <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              {customer.status}
            </span>
            <button onClick={handleDeleteCustomer} className="p-1 text-red-600 hover:bg-red-50 rounded-md">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center"><Mail className="h-4 w-4 mr-2"/> Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.email || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center"><Phone className="h-4 w-4 mr-2"/> Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.phone || '-'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <h2 className="text-xl font-bold text-gray-900">Customer Journey</h2>
        <button
          onClick={() => setIsJourneyModalOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Interaction
        </button>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-100 p-6">
        {journeys.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No interactions recorded yet. Add a visit or call to start the journey.</p>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {journeys.map((journey, journeyIdx) => (
                <li key={journey.id}>
                  <div className="relative pb-8">
                    {journeyIdx !== journeys.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                          <MapPin className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{journey.type}</span>
                          </p>
                          <div className="mt-2 text-sm text-gray-700">
                            <p className="whitespace-pre-wrap">{journey.notes}</p>
                          </div>
                          {journey.next_steps && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
                              <span className="font-medium text-gray-900">Next Steps: </span>
                              {journey.next_steps}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500 flex flex-col items-end">
                          <time dateTime={journey.date} className="font-medium text-gray-900">{new Date(journey.date).toLocaleDateString()}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add Journey Modal */}
      {isJourneyModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsJourneyModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateJourney}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Record Interaction</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date *</label>
                      <input type="date" required value={journeyDate} onChange={e => setJourneyDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type *</label>
                      <select required value={journeyType} onChange={e => setJourneyType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="Visit">Visit</option>
                        <option value="Call">Call</option>
                        <option value="Email">Email</option>
                        <option value="Meeting">Meeting</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea rows={3} value={journeyNotes} onChange={e => setJourneyNotes(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="What was discussed?" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Next Steps</label>
                      <textarea rows={2} value={journeyNextSteps} onChange={e => setJourneyNextSteps(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Action items..." />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Save
                  </button>
                  <button type="button" onClick={() => setIsJourneyModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
