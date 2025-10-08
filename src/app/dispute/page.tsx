'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetDisputesQuery } from '../../store/api/disputApi';
import { Dispute } from './types/disputeTypes';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/store/hooks';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';


// interface Dispute {
//   _id: string;
//   title: string;
//   description: string;
//   complainant: { firstName: string; lastName: string };
//   respondent: { firstName: string; lastName: string };
//   currentStage: string;
//   status: string;
//   resolution?: { compensation?: { amount: number } };
//   createdAt: string;
// }

export default function DisputeManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [page, setPage] = useState(1);

  // Authentication hooks
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: string | { data?: unknown; contentType?: string; url?: string } | null | undefined) => {
    if (!profileImage) return null;
    
    // Handle string URLs
    if (typeof profileImage === 'string') {
      if (profileImage.startsWith('http')) return profileImage;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`;
    }
    
    // Handle object with data and contentType (Buffer)
    if (typeof profileImage === 'object' && profileImage.data && profileImage.contentType) {
      const dataUrl = `data:${profileImage.contentType};base64,${(profileImage.data as { toString: (encoding: string) => string }).toString('base64')}`;
      return dataUrl;
    }
    
    // Handle object with url property
    if (typeof profileImage === 'object' && profileImage.url) {
      if (profileImage.url.startsWith('http')) return profileImage.url;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage.url}`;
    }
    
    return null;
  };

  const { data } = useGetDisputesQuery({
    status: statusFilter === 'All Statuses' ? undefined : statusFilter.toLowerCase(),
    stage: stageFilter === 'All Stages' ? undefined : stageFilter.toLowerCase().replace(' ', '-'),
    page,
  });

  // Safely extract disputes and pagination
  const disputes: Dispute[] = data?.disputes || [];
  const totalPages: number = data?.pagination?.pages || 1;

  // Local search filtering
  const filtered: Dispute[] = disputes.filter(d =>
    (d.title + d.description).toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("filtered log from line 50 of page.tsx", disputes);
  

  // Stats calculations
  const active = disputes.filter(d => d.status.toLowerCase() === 'active').length;
  const resolved = disputes.filter(d => d.status.toLowerCase() === 'resolved').length;
  const escalated = disputes.filter(d => d.status.toLowerCase() === 'escalated').length;
  const totalAmt = disputes.reduce((t, d) => t + (d.resolution?.compensation?.amount || 0), 0);

  // Helper functions to get CSS classes
  const getStatusColor = (s: string) =>
    s.toLowerCase() === 'active' ? 'bg-blue-100 text-blue-700' :
    s.toLowerCase() === 'resolved' ? 'bg-green-100 text-green-700' :
    s.toLowerCase() === 'escalated' ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-700';

  const getStageColor = (s: string) =>
    s.toLowerCase() === 'peer-to-peer' ? 'bg-purple-100 text-purple-700' :
    s.toLowerCase() === 'mediation' ? 'bg-yellow-100 text-yellow-700' :
    s.toLowerCase() === 'legal' ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-700';
console.log("filtered data", filtered);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user || undefined}
        currentUserData={currentUserData}
        isAuthenticated={isAuthenticated}
        forceHomepageStyle={true}
        getProfileImageUrl={getProfileImageUrl}
      />
      <Sidebar />
      
      <div className="ml-64 pt-20">
        <main className="flex-1 p-8">
          <div className="bg-gradient-to-r from-[#FF9974] via-[#FFB194] to-[#FFCBB8] rounded-lg flex justify-between items-center p-6 mb-8">
            <div>
              <h1 className="text-xl font-bold text-black">Dispute Resolution Center</h1>
              <p className="text-white text-sm">
                Manage and resolve disputes efficiently with streamlined workflows
              </p>
            </div>
            <button onClick={() => router.push('/dispute/create')} className="bg-[#FF6B35] text-white px-4 py-2 rounded-md font-medium">
              + File New Dispute
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard title="Active Disputes" value={active} color="text-[#FF6B35]" />
            <StatCard title="Resolved" value={resolved} color="text-[#FF8B00]" />
            <StatCard title="Escalated" value={escalated} color="text-[#FF3B30]" />
            <StatCard title="Total Amount" value={`₹${totalAmt}`} color="text-[#FF6B35]" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-orange-400 font-semibold">All Disputes</h2>
            <span className="px-3 py-1 text-sm text-orange-500 border border-orange-300 rounded-full">
              {filtered.length} of {disputes.length} Disputes
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-[2]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  className="w-full pl-9 border border-orange-200 rounded-md py-2 focus:ring-2 focus:ring-orange-300 outline-none"
                  placeholder="Search Disputes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <select
                  value={stageFilter}
                  onChange={e => setStageFilter(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-md py-2 pl-10 pr-8 text-sm bg-white focus:ring-2 focus:ring-orange-300"
                >
                  {['All Stages', 'Peer to peer', 'Mediation', 'Legal', 'Resolved'].map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="w-48">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-md py-2 px-3 text-sm bg-white focus:ring-2 focus:ring-orange-300"
                >
                  {['All Statuses', 'Active', 'Resolved', 'Escalated'].map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <table className="min-w-full table-auto border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-sm text-gray-700" style={{ backgroundColor: '#FFF4EB' }}>
                  <th className="px-4 py-3 font-semibold text-gray-800">Event & Reason</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Parties Involved</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Current Stage</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Amount</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Date Filed</th>
                  <th className="px-4 py-3 font-semibold text-gray-800 text-center">Manage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d._id} className="border-b last:border-0 hover:bg-orange-50/40">
                    <td className="px-4 py-3 align-middle">
                      <div className="font-medium text-gray-900">{d.title}</div>
                      <div className="text-xs text-gray-500">{d.description}</div>
                    </td>
                  <td className="px-4 py-3 align-middle">
                   <div className="flex flex-wrap gap-2">
                  {/* Complainant */}
                    <span className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm border border-orange-200">
                    {d.complainant.firstName} {d.complainant.lastName}
                  </span>
                  {/* Respondents array */}
                  {d.respondent?.map((r, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm border border-orange-200">
                  {r.firstName} {r.lastName}
                </span>
    ))}
  </div>
</td>

                    <td className="px-4 py-3 align-middle">
                      <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium ${getStageColor(d.currentStage)}`}>{d.currentStage}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-medium ${getStatusColor(d.status)}`}>{d.status}</span>
                    </td>
                    <td>{d.disputeAmount} {d.disputeCurrency || 'INR'}</td>

                    <td className="px-4 py-3 align-middle">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center align-middle">
                      <Link href={`/dispute/${d._id}`} className="p-2 text-gray-400 hover:text-orange-600">
                        <FileText size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md border ${page === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-orange-50 border-orange-300'}`}
            >
              Prev
            </button>
            <span className="px-3 py-1 rounded-md border bg-white">{page}</span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md border ${page === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-orange-50 border-orange-300'}`}
            >
              Next
            </button>
          </div>

          {/* Modal removed - navigating to /dispute/create instead */}
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start">
      <div className="text-sm font-medium text-gray-400 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${color} mb-2`}>{value}</div>
      <div className="text-xs text-gray-400">Marketing unbound</div>
      <div className="text-xs text-gray-400">October 1, 2025</div>
    </div>
  );
}