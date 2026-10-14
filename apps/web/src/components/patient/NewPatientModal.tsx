import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPatient: any) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1980-01-01');
  const [gender, setGender] = useState('MALE');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [allergies, setAllergies] = useState('');
  const [diabetes, setDiabetes] = useState(false);
  const [hypertension, setHypertension] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPt = {
      id: `enc-${Date.now()}`,
      mrn: `EYE-2026-000${Math.floor(100 + Math.random() * 900)}`,
      name: `${firstName} ${lastName}`,
      age: 2026 - parseInt(dob.slice(0, 4)),
      gender: gender === 'MALE' ? 'M' : 'F',
      phone,
      status: 'REGISTERED',
      tokenNumber: Math.floor(100 + Math.random() * 50),
      chiefComplaint: 'New patient registration',
    };
    onSuccess(newPt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Patient Registration & Triage
          </h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Date of Birth *</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded bg-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700">National ID (Aadhaar / Passport)</label>
            <input
              type="text"
              placeholder="XXXX-XXXX-XXXX"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Known Drug Allergies</label>
            <input
              type="text"
              placeholder="e.g. Ciprofloxacin, Sulfa, Latex (Leave blank if none)"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="font-semibold text-slate-700 block mb-2">Systemic Medical History</span>
            <div className="flex gap-4">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={diabetes}
                  onChange={(e) => setDiabetes(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="text-slate-800">Diabetes Mellitus</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hypertension}
                  onChange={(e) => setHypertension(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="text-slate-800">Hypertension</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 transition"
            >
              Register & Add to Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
