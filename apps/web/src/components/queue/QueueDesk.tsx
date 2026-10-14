import React, { useState } from 'react';
import { Users, Clock, ArrowRight, UserPlus, Droplets, Search } from 'lucide-react';
import { VisitStatus } from '@ehms/shared';

interface QueueItem {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  status: VisitStatus;
  tokenNumber: number;
  dilatedAt?: string;
  chiefComplaint: string;
}

interface QueueDeskProps {
  onSelectPatient: (patientId: string) => void;
  onOpenRegisterModal: () => void;
}

export const QueueDesk: React.FC<QueueDeskProps> = ({ onSelectPatient, onOpenRegisterModal }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [queue, setQueue] = useState<QueueItem[]>([
    {
      id: 'enc-1',
      mrn: 'EYE-2026-000101',
      name: 'Ramesh Kumar',
      age: 60,
      gender: 'M',
      phone: '+91 98111 22334',
      status: 'DOCTOR_EXAM',
      tokenNumber: 101,
      dilatedAt: '10:15 AM',
      chiefComplaint: 'Diminution of vision right eye, night glare',
    },
    {
      id: 'enc-2',
      mrn: 'EYE-2026-000102',
      name: 'Sunita Rao',
      age: 52,
      gender: 'F',
      phone: '+91 98222 33445',
      status: 'DILATING',
      tokenNumber: 102,
      dilatedAt: '10:40 AM',
      chiefComplaint: 'Routine glaucoma follow-up, eye redness',
    },
    {
      id: 'enc-3',
      mrn: 'EYE-2026-000103',
      name: 'Mohammad Tariq',
      age: 38,
      gender: 'M',
      phone: '+91 98333 44556',
      status: 'OPTOMETRY_IN_PROGRESS',
      tokenNumber: 103,
      chiefComplaint: 'Headache & blurred near vision with computers',
    },
    {
      id: 'enc-4',
      mrn: 'EYE-2026-000104',
      name: 'Aanya Verma',
      age: 8,
      gender: 'F',
      phone: '+91 98444 55667',
      status: 'REGISTERED',
      tokenNumber: 104,
      chiefComplaint: 'Squint evaluation / school vision screening referral',
    },
  ]);

  const handleDilate = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'DILATING',
              dilatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : item
      )
    );
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
            Today's Outpatient Clinic Queue
          </h2>
          <p className="text-xs text-slate-500">Live patient handoff tracking (Registration → Optometry → Dilation → Doctor Exam)</p>
        </div>

        <div className="flex items-center space-x-3">
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
            {filteredQueue.map((pt) => {
              return (
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
                        onClick={() => handleDilate(pt.id)}
                        title="Instill Dilation Drops"
                        className="p-1 rounded text-purple-600 hover:bg-purple-50 transition"
                      >
                        <Droplets className="w-4 h-4 inline" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectPatient(pt.id)}
                      className="px-3 py-1 bg-slate-900 text-white rounded hover:bg-slate-800 font-medium transition inline-flex items-center gap-1"
                    >
                      <span>Open Chart</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
