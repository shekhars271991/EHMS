import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Phone, Calendar, ArrowRight, RefreshCw, FolderSearch, UserCheck, MapPin } from 'lucide-react';
import { api } from '../../api/client';

interface PatientItem {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  address?: string;
  allergies: string[];
  systemicHistory: { diabetes?: boolean; hypertension?: boolean };
  createdAt: string;
  encounters?: any[];
}

interface PatientDirectoryProps {
  onSelectPatient: (patientId: string) => void;
  onOpenRegisterModal: () => void;
}

export const PatientDirectory: React.FC<PatientDirectoryProps> = ({ onSelectPatient, onOpenRegisterModal }) => {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPatients = async (query?: string) => {
    setLoading(true);
    try {
      const data = await api.getPatients(query);
      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(searchTerm);
  };

  const handleOpenProfile = (patientId: string) => {
    onSelectPatient(patientId);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderSearch className="w-5 h-5 text-emerald-600" />
            Patient Directory & Master Index
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, lookup patient records by Name, Phone Number, or MRN ID
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-semibold shadow-sm transition self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Bar (Name, Phone Number, or MRN ID) */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value === '') fetchPatients('');
              }}
              placeholder="Search by Name (e.g. Ramesh), Phone Number (e.g. 7408089279), or MRN ID (e.g. EYE-2026-000101)..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchPatients('');
              }}
              className="px-3 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium text-xs rounded-lg transition"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchPatients(searchTerm)}
            title="Refresh patient list"
            className="p-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </form>

      {/* Search results summary */}
      <div className="flex justify-between items-center text-xs text-slate-500 mb-3 px-1">
        <span>
          Showing <strong>{patients.length}</strong> registered patient{patients.length !== 1 ? 's' : ''}
          {searchTerm && ` for query "${searchTerm}"`}
        </span>
        <span className="text-[11px] text-slate-400">
          Search indexed by Name, Phone Number, and MRN ID
        </span>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
              <th className="py-3 px-4">MRN</th>
              <th className="py-3 px-4">Patient Name</th>
              <th className="py-3 px-4">Mobile Phone</th>
              <th className="py-3 px-4">Age / Gender</th>
              <th className="py-3 px-4">Address</th>
              <th className="py-3 px-4">Registration Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  {loading ? 'Searching patient records...' : `No patients found matching "${searchTerm}".`}
                </td>
              </tr>
            ) : (
              patients.map((pt) => {
                const birthYear = pt.dob ? new Date(pt.dob).getFullYear() : 1970;
                const age = new Date().getFullYear() - birthYear;
                const regDate = pt.createdAt ? new Date(pt.createdAt).toLocaleDateString('en-GB') : '-';

                return (
                  <tr key={pt.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {pt.mrn}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm block">
                        {pt.firstName} {pt.lastName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {pt.phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {age}y / {pt.gender}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[220px]">
                      {pt.address ? (
                        <span className="flex items-start gap-1.5" title={pt.address}>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{pt.address}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {regDate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenProfile(pt.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition inline-flex items-center gap-1 text-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Open profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
