import React, { useState } from 'react';
import { X, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patient: any) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1985-01-01');
  const [gender, setGender] = useState('MALE');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [allergies, setAllergies] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const allergyList = allergies
        ? allergies.split(',').map((a) => a.trim()).filter(Boolean)
        : [];

      const patient = await api.createPatient({
        firstName,
        lastName,
        dob,
        gender,
        phone: phone.trim(),
        address: address.trim() || undefined,
        idCard: aadhaar ? { type: 'Aadhaar', number: aadhaar } : null,
        allergies: allergyList,
        systemicHistory: {},
      });

      onSuccess(patient);
      onClose();
    } catch (err: any) {
      console.error('Failed to create patient:', err);
      const msg = err.response?.data?.error || err.message;
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Patient Registration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Quick demographic intake & clinic queue entry</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">First Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Shekhar"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Last Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kumar"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                className="w-full mt-1 p-2 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                placeholder="e.g. 7408089279"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Address field (Required for patient records) */}
          <div>
            <label className="font-semibold text-slate-700">
              Address * <span className="font-normal text-slate-400">(Street, Locality, City, State, PIN)</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. H.No 45, Near Main Market, Sigra, Varanasi, UP - 221010"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">National ID (Aadhaar / Passport)</label>
              <input
                type="text"
                placeholder="XXXX-XXXX-XXXX"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Known Drug Allergies</label>
              <input
                type="text"
                placeholder="e.g. Ciprofloxacin, Sulfa (or leave blank)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-1 px-5 py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 transition"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Saving...' : 'Register patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
