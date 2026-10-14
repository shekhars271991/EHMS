import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Printer, Save, Check } from 'lucide-react';
import { PrescriptionItem, OcularSide } from '@ehms/shared';
import { api } from '../../api/client';

const COMMON_MEDICATIONS = [
  'Moxifloxacin 0.5% Eye Drops',
  'Prednisolone Acetate 1% Ophthalmic Suspension',
  'Carboxymethylcellulose 0.5% Lubricant Eye Drops',
  'Timolol 0.5% Eye Drops',
  'Nepafenac 0.1% Eye Drops',
  'Latanoprost 0.005% Eye Drops',
  'Tobramycin 0.3% + Dexamethasone 0.1% Drops',
  'Homatropine 2% Eye Drops',
  'Sodium Hyaluronate 0.1% Eye Drops',
];

interface PrescriptionPadProps {
  encounterId: string;
  patientName?: string;
  mrn?: string;
  allergies?: string[];
  initialPrescriptions?: any[];
  onSaved?: () => void;
}

export const PrescriptionPad: React.FC<PrescriptionPadProps> = ({
  encounterId,
  patientName = 'Ramesh Kumar',
  mrn = 'EYE-2026-000101',
  allergies = ['Ciprofloxacin'],
  initialPrescriptions,
  onSaved,
}) => {
  const [items, setItems] = useState<PrescriptionItem[]>([]);

  const [newDrug, setNewDrug] = useState('');
  const [newEye, setNewEye] = useState<OcularSide>('OD');
  const [newDosage, setNewDosage] = useState('1 drop');
  const [newFreq, setNewFreq] = useState('TID (3 times/day)');
  const [newDuration, setNewDuration] = useState('14 days');
  const [newNotes, setNewNotes] = useState('');
  const [generalAdvice, setGeneralAdvice] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const latest = initialPrescriptions?.[0];
    setItems(latest?.items || []);
    setGeneralAdvice(latest?.generalAdvice || '');
  }, [encounterId, initialPrescriptions]);

  const addItem = () => {
    if (!newDrug.trim()) {
      alert('Enter a medication name first.');
      return;
    }
    setItems([
      ...items,
      {
        drugName: newDrug.trim(),
        eye: newEye,
        dosage: newDosage,
        frequency: newFreq,
        duration: newDuration,
        specialInstructions: newNotes,
      },
    ]);
    setNewDrug('');
    setNewNotes('');
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      alert('Add at least one medication before saving the prescription.');
      return;
    }
    setSaving(true);
    try {
      await api.createPrescription(encounterId, items, generalAdvice.trim() || undefined);
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save prescription:', err);
      alert('Error saving prescription: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Action Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 no-print">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-lg">Ophthalmic Prescription Pad</h3>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition ${
              saved ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Prescription saved' : saving ? 'Saving...' : 'Save prescription'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Prescription (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Letterhead */}
      <div className="print-target border border-slate-200 rounded-lg p-6 bg-white shadow-2xs">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white p-1 border border-emerald-500/30 shadow shrink-0">
              <img
                src="/assets/clinic_logo.jpg"
                alt="Lakshmi Abha Eye Care Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                LAKSHMI ABHA EYE CARE
              </h1>
              <p className="text-xs font-bold text-emerald-700 tracking-wide">
                WELLNESS CENTER • "Your Vision Our Priority"
              </p>
              <p className="text-[11px] text-slate-500">Super-Specialty Ophthalmology & Vitreo-Retinal Surgery Center</p>
              <p className="text-[11px] text-slate-500">Phone: +91 74080 89279 / +91 80890 91254 | lakshmiabhaeyecarewellnesscenter@gmail.com</p>
            </div>
          </div>
          <div className="text-right text-xs shrink-0 pl-4">
            <p className="font-bold text-sm text-slate-900">Dr. Prajjwal Kumar, MS (Ophthal)</p>
            <p className="text-slate-600">Reg No: KMC-OPH-54129</p>
            <p className="text-emerald-700 font-semibold text-[11px]">Senior Vitreo-Retinal Surgeon</p>
            <p className="text-slate-400 mt-1">Date: {new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        {/* Patient Bar */}
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs mb-6 grid grid-cols-4 gap-2">
          <div><strong>Patient:</strong> {patientName}</div>
          <div><strong>MRN:</strong> {mrn}</div>
          <div><strong>Clinic:</strong> Cataract & Cornea</div>
          <div><strong>Allergies:</strong> <span className="text-red-600 font-bold">{allergies.join(', ') || 'None'}</span></div>
        </div>

        {/* Prescription Table */}
        <div className="mb-6">
          <div className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1">
            <span className="text-emerald-700 font-serif italic text-lg font-bold">℞</span> Prescription Medications
          </div>

          <table className="w-full text-left text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-2.5">#</th>
                <th className="p-2.5">Medication & Strength</th>
                <th className="p-2.5">Eye</th>
                <th className="p-2.5">Dosage</th>
                <th className="p-2.5">Frequency</th>
                <th className="p-2.5">Duration</th>
                <th className="p-2.5">Instructions</th>
                <th className="p-2.5 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-2.5 font-bold text-slate-900">{item.drugName}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      item.eye === 'OD'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : item.eye === 'OS'
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : 'bg-purple-100 text-purple-800 border border-purple-300'
                    }`}>
                      {item.eye === 'OD' ? 'OD (Right Eye)' : item.eye === 'OS' ? 'OS (Left Eye)' : 'OU (Both Eyes)'}
                    </span>
                  </td>
                  <td className="p-2.5 font-medium">{item.dosage}</td>
                  <td className="p-2.5 font-medium text-slate-800">{item.frequency}</td>
                  <td className="p-2.5">{item.duration}</td>
                  <td className="p-2.5 text-slate-600 italic">{item.specialInstructions || '-'}</td>
                  <td className="p-2.5 text-center no-print">
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {generalAdvice.trim() && (
          <div className="mb-6 text-sm whitespace-pre-wrap">
            <strong>Instructions:</strong> {generalAdvice}
          </div>
        )}

        {/* Doctor Signature line */}
        <div className="flex justify-between items-end pt-8 mt-6 border-t border-slate-200 text-xs">
          <div>
            <p className="font-semibold text-slate-700">Next Follow-Up: 1 Week Post-Op</p>
            <p className="text-[11px] text-slate-400">Emergency 24x7 Casualty: +91 11 4567 8999</p>
          </div>
          <div className="text-center">
            <div className="w-44 border-b border-slate-400 mb-1"></div>
            <p className="font-bold text-slate-900">Dr. Prajjwal Kumar, MS</p>
            <p className="text-[10px] text-slate-500">Senior Vitreo-Retinal Surgeon</p>
          </div>
        </div>
      </div>

      {/* Add Medication Form (no-print) */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 no-print">
        <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-emerald-600" /> Add Medication
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-3">
          <div>
            <label className="font-medium text-slate-600">Medication</label>
            <input
              type="text"
              list="common-medications"
              value={newDrug}
              onChange={(e) => setNewDrug(e.target.value)}
              placeholder="Start typing a medication..."
              className="w-full mt-1 p-2 border border-slate-300 rounded bg-white font-medium"
            />
            <datalist id="common-medications">
              {COMMON_MEDICATIONS.map((medication) => <option key={medication} value={medication} />)}
            </datalist>
          </div>
          <div>
            <label className="font-medium text-slate-600">Eye Laterality</label>
            <select
              value={newEye}
              onChange={(e) => setNewEye(e.target.value as OcularSide)}
              className="w-full mt-1 p-2 border border-slate-300 rounded bg-white font-bold"
            >
              <option value="OD">OD (Right Eye)</option>
              <option value="OS">OS (Left Eye)</option>
              <option value="OU">OU (Both Eyes)</option>
            </select>
          </div>
          <div>
            <label className="font-medium text-slate-600">Frequency</label>
            <select
              value={newFreq}
              onChange={(e) => setNewFreq(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded bg-white"
            >
              <option value="TID (3 times/day)">TID (3 times / day)</option>
              <option value="QID (4 times/day)">QID (4 times / day)</option>
              <option value="BD (2 times/day)">BD (2 times / day)</option>
              <option value="1 hourly (Daytime)">1 hourly (Daytime)</option>
              <option value="HS (Bedtime)">HS (At bedtime)</option>
              <option value="Tapering (Weekly)">Tapering (Weekly decrement)</option>
            </select>
          </div>
          <div>
            <label className="font-medium text-slate-600">Dosage</label>
            <input
              type="text"
              value={newDosage}
              onChange={(e) => setNewDosage(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded bg-white"
            />
          </div>
          <div>
            <label className="font-medium text-slate-600">Duration</label>
            <input
              type="text"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded bg-white"
            />
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <label className="font-medium text-slate-600">Instructions / Notes</label>
            <input
              type="text"
              value={newNotes}
              placeholder="e.g. Shake well, keep 5m gap"
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full mt-1 p-2 border border-slate-300 rounded bg-white"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs font-medium text-slate-600">Prescription instructions</label>
          <textarea
            value={generalAdvice}
            onChange={(e) => setGeneralAdvice(e.target.value)}
            placeholder="Add instructions for this visit's prescription"
            rows={2}
            className="w-full mt-1 p-2 border border-slate-300 rounded bg-white text-sm"
          />
        </div>
        <button
          onClick={addItem}
          className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 transition"
        >
          Add to Prescription
        </button>
      </div>
    </div>
  );
};
