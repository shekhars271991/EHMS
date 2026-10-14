import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, UserPlus, Search, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

interface QueueItem {
  id: string;
  encounterId: string;
  patientId: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  status: string;
  isComplete: boolean;
  tokenNumber: number;
  chiefComplaint: string;
}

interface QueueDeskProps {
  onSelectPatient: (patientId: string, visitId?: string) => void;
  onOpenRegisterModal: () => void;
}

export const QueueDesk: React.FC<QueueDeskProps> = ({ onSelectPatient, onOpenRegisterModal }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const encounters = await api.getQueue();
      const mapped = (encounters || []).map((e: any) => {
          const birthYear = e.patient.dob ? new Date(e.patient.dob).getFullYear() : 1970;
          return {
            id: e.id,
            encounterId: e.id,
            patientId: e.patientId,
            mrn: e.patient.mrn,
            name: `${e.patient.firstName} ${e.patient.lastName}`,
            age: new Date().getFullYear() - birthYear,
            gender: e.patient.gender,
            phone: e.patient.phone,
            status: e.status,
            isComplete: e.status === 'COMPLETED' || Boolean(e.prescriptions?.length),
            tokenNumber: e.tokenNumber,
            chiefComplaint: e.chiefComplaint || 'Routine ophthalmic consultation',
          };
      });
      setQueue(mapped);
    } catch (err) {
      console.error('Error fetching live queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const searchedQueue = queue.filter((item) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.mrn.toLowerCase().includes(q) ||
        item.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      {/* Header & Registration CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Today's Outpatient Clinic Queue
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchQueue}
            title="Refresh queue"
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Name, Phone, or MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-64 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={onOpenRegisterModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-semibold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Patient</span>
          </button>
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
              <th className="py-3 px-3">Token</th>
              <th className="py-3 px-3">MRN</th>
              <th className="py-3 px-3">Patient Name</th>
              <th className="py-3 px-3">Age/Sex</th>
              <th className="py-3 px-3">Chief Complaint</th>
              <th className="py-3 px-3">Visit Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {searchedQueue.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  {loading ? 'Loading queue...' : 'No patients found for today.'}
                </td>
              </tr>
            ) : (
              searchedQueue.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    #{pt.tokenNumber}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 font-medium">{pt.mrn}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{pt.name}</td>
                  <td className="py-3 px-3 text-slate-600">{pt.age}y / {pt.gender}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{pt.chiefComplaint}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-semibold ${pt.isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {pt.isComplete ? 'Visit complete' : 'Waiting in line'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => onSelectPatient(pt.patientId, pt.encounterId)}
                      className="px-3 py-1 bg-slate-900 text-white rounded hover:bg-slate-800 font-medium transition inline-flex items-center gap-1"
                    >
                      <span>Open Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
