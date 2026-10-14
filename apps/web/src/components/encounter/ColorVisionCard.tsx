import React, { useEffect, useState } from 'react';
import { Palette, Save, Check } from 'lucide-react';
import { ColorVisionData, ColorVisionEye } from '@ehms/shared';
import { api } from '../../api/client';

interface ColorVisionCardProps {
  patientId: string;
  initialData?: ColorVisionData | null;
}

const emptyEye: ColorVisionEye = { platesCorrect: 17, platesTotal: 17, result: 'NORMAL' };

export const ColorVisionCard: React.FC<ColorVisionCardProps> = ({ patientId, initialData }) => {
  const [testType, setTestType] = useState<ColorVisionData['testType']>('ISHIHARA');
  const [od, setOd] = useState(emptyEye);
  const [os, setOs] = useState(emptyEye);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setTestType(initialData.testType || 'ISHIHARA');
    if (initialData.OD) setOd({ ...emptyEye, ...initialData.OD });
    if (initialData.OS) setOs({ ...emptyEye, ...initialData.OS });
    setNotes(initialData.notes || '');
  }, [initialData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updatePatientProfile(patientId, {
        colorVision: { testType, OD: od, OS: os, notes: notes || undefined },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert('Error saving color vision: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const eyeFields = (
    label: string,
    eye: typeof od,
    setEye: (v: typeof od) => void,
    accent: string
  ) => (
    <div className={`p-4 rounded-lg border ${accent}`}>
      <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
        {label}
      </span>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label className="text-xs text-slate-500 font-medium">Plates correct</label>
          <input
            type="number"
            min={0}
            value={eye.platesCorrect}
            onChange={(e) => setEye({ ...eye, platesCorrect: Number(e.target.value) || 0 })}
            className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium">Plates total</label>
          <input
            type="number"
            min={1}
            value={eye.platesTotal}
            onChange={(e) => setEye({ ...eye, platesTotal: Number(e.target.value) || 17 })}
            className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium">Result</label>
          <select
            value={eye.result}
            onChange={(e) => setEye({ ...eye, result: e.target.value as typeof eye.result })}
            className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded bg-white text-sm font-medium"
          >
            <option value="NORMAL">Normal</option>
            <option value="DEFICIENT">Deficient</option>
            <option value="NOT_TESTED">Not tested</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium">Deficiency type</label>
          <select
            value={eye.deficiencyType || ''}
            onChange={(e) =>
              setEye({
                ...eye,
                deficiencyType: (e.target.value || undefined) as typeof eye.deficiencyType,
              })
            }
            className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded bg-white text-sm"
            disabled={eye.result !== 'DEFICIENT'}
          >
            <option value="">—</option>
            <option value="PROTAN">Protan</option>
            <option value="DEUTAN">Deutan</option>
            <option value="TRITAN">Tritan</option>
            <option value="UNSPECIFIED">Unspecified</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="responsive-card bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
      <div className="clinical-card-header flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-violet-600" />
          <h3 className="font-bold text-slate-800 text-base">Color Vision</h3>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value as ColorVisionData['testType'])}
            className="text-xs border border-slate-300 rounded px-2 py-1 font-semibold bg-white"
          >
            <option value="ISHIHARA">Ishihara plates</option>
            <option value="FARNSWORTH">Farnsworth D-15</option>
            <option value="OTHER">Other</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving || !patientId}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition ${
              saved ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved' : saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eyeFields('OD (Right Eye)', od, setOd, 'bg-emerald-50/40 border-emerald-200')}
        {eyeFields('OS (Left Eye)', os, setOs, 'bg-sky-50/40 border-sky-200')}
      </div>
      <div className="mt-3">
        <label className="text-xs text-slate-500 font-medium">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional observations"
          className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-sm"
        />
      </div>
    </div>
  );
};
