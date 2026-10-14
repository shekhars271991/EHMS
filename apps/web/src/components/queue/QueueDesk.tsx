import React, { useState, useEffect } from 'react';
import { Users, Clock, ArrowRight, UserPlus, Droplets, Search, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

interface QueueItem {
  id: string;
  encounterId: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  status: string;
  tokenNumber: number;
  dilatedAt?: string;
  chiefComplaint: string;
}

interface QueueDeskProps {
  onSelectPatient: (encounterId: string) => void;
  onOpenRegisterModal: () => void;
}

export const QueueDesk: React.FC<QueueDeskProps> = ({ onSelectPatient, onOpenRegisterModal }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Ensure we have a dev token
      await api.login();
      const encounters = await api.getQueue();
      if (encounters && encounters.length > 0) {
        const mapped = encounters.map((e: any) => {
          const birthYear = e.patient.dob ? new Date(e.patient.dob).getFullYear() : 1970;
          return {
            id: e.id,
            encounterId: e.id,
            mrn: e.patient.mrn,
            name: `${e.patient.firstName} ${e.patient.lastName}`,
            age: new Date().getFullYear() - birthYear,
            gender: e.patient.gender,
            phone: e.patient.phone,
            status: e.status,
            tokenNumber: e.tokenNumber,
            dilatedAt: e.dilatedAt ? new Date(e.dilatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            chiefComplaint: e.chiefComplaint || 'Routine ophthalmic consultation',
          };
        });
        setQueue(mapped);
      }
    } catch (err) {
      console.error('Error fetching live queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDilate = async (encounterId: string) => {
    try {
      await api.updateEncounterStatus(encounterId, 'DILATING', 'Tropicamide 0.8% + Phenylephrine 5%');
      await fetchQueue();
    } catch (err) {
      console.error('Error setting dilation:', err);
    }
  };

  const filteredQueue = queue.filter((item) => {
    if (filter !== 'ALL' && item.status !== filter) return false;
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
            Today's Outpatient Clinic Queue (Live PostgreSQL)
          </h2>
          <p className="text-xs text-slate-500">Live patient stages: Registration → Optometry → Dilation → Doctor Exam</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchQueue}
            title="Refresh queue from PostgreSQL"
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by MRN, Name, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-60 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-3 mb-4 overflow-x-auto text-xs">
        {[
          { key: 'ALL', label: 'All Patients' },
          { key: 'REGISTERED', label: 'Triage Waiting' },
          { key: 'OPTOMETRY_IN_PROGRESS', label: 'Optometry Workup' },
          { key: 'DILATING', label: 'Pupil Dilating' },
          { key: 'DOCTOR_EXAM', label: 'In Doctor Lane' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full font-semibold transition ${
              filter === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
              <th className="py-3 px-3">Queue Stage</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredQueue.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  {loading ? 'Loading queue from PostgreSQL...' : 'No patients found in this queue category.'}
                </td>
              </tr>
            ) : (
              filteredQueue.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    #{pt.tokenNumber}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 font-medium">{pt.mrn}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{pt.name}</td>
                  <td className="py-3 px-3 text-slate-600">{pt.age}y / {pt.gender}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{pt.chiefComplaint}</td>
                  <td className="py-3 px-3">
                    {pt.status === 'REGISTERED' && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        Waiting for Workup
                      </span>
                    )}
                    {pt.status === 'OPTOMETRY_IN_PROGRESS' && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                        In Optometry
                      </span>
                    )}
                    {pt.status === 'DILATING' && (
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3 animate-spin text-purple-600" />
                        Dilating @ {pt.dilatedAt}
                      </span>
                    )}
                    {pt.status === 'DOCTOR_EXAM' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        Ready in Doctor Lane
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    {pt.status !== 'DILATING' && (
                      <button
                        onClick={() => handleDilate(pt.encounterId)}
                        title="Instill Dilation Drops"
                        className="p-1 rounded text-purple-600 hover:bg-purple-50 transition"
                      >
                        <Droplets className="w-4 h-4 inline" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectPatient(pt.encounterId)}
                      className="px-3 py-1 bg-slate-900 text-white rounded hover:bg-slate-800 font-medium transition inline-flex items-center gap-1"
                    >
                      <span>Open Chart</span>
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
