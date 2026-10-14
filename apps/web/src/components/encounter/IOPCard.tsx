import React, { useState, useMemo, useEffect } from 'react';
import { Gauge, AlertCircle, Save, Check } from 'lucide-react';
import { TonometryMethod } from '@ehms/shared';
import { api } from '../../api/client';

interface IOPCardProps {
  encounterId?: string;
  patientId?: string;
  initialIOP?: any;
}

export const IOPCard: React.FC<IOPCardProps> = ({ encounterId, patientId, initialIOP }) => {
  const [method, setMethod] = useState<TonometryMethod>('GOLDMANN');
  const [iopOD, setIopOD] = useState<number>(15);
  const [iopOS, setIopOS] = useState<number>(14);
  const [cctOD, setCctOD] = useState<number>(540);
  const [cctOS, setCctOS] = useState<number>(542);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialIOP) {
      if (initialIOP.method) setMethod(initialIOP.method);
      if (initialIOP.iopOD) setIopOD(Number(initialIOP.iopOD));
      if (initialIOP.iopOS) setIopOS(Number(initialIOP.iopOS));
      if (initialIOP.pachymetryOD) setCctOD(Number(initialIOP.pachymetryOD));
      if (initialIOP.pachymetryOS) setCctOS(Number(initialIOP.pachymetryOS));
    }
  }, [initialIOP]);

  const correctedOD = useMemo(() => {
    if (!cctOD) return iopOD;
    const diff = (545 - cctOD) / 50 * 2.5;
    return Number((iopOD + diff).toFixed(1));
  }, [iopOD, cctOD]);

  const correctedOS = useMemo(() => {
    if (!cctOS) return iopOS;
    const diff = (545 - cctOS) / 50 * 2.5;
    return Number((iopOS + diff).toFixed(1));
  }, [iopOS, cctOS]);

  const isHighOD = correctedOD > 21;
  const isHighOS = correctedOS > 21;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        method,
        iopOD,
        iopOS,
        pachymetryOD: cctOD,
        pachymetryOS: cctOS,
        correctedOD,
        correctedOS,
        measuredAt: new Date().toISOString(),
      };
      if (patientId) {
        await api.updatePatientProfile(patientId, { intraocularPressure: payload });
      } else if (encounterId) {
        await api.saveIOP(encounterId, payload);
      } else {
        throw new Error('No patient or visit selected');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save IOP:', err);
      alert('Error saving IOP: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Gauge className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-800 text-base">Intraocular Pressure (Tonometry)</h3>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <label className="text-xs font-medium text-slate-500">Method:</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as TonometryMethod)}
              className="text-xs border border-slate-300 rounded px-2 py-1 font-semibold text-slate-700 bg-white"
            >
              <option value="GOLDMANN">Goldmann Applanation (GAT)</option>
              <option value="NCT">Non-Contact Tonometry (Air Puff)</option>
              <option value="TONOPEN">Tonopen</option>
              <option value="PERKINS">Perkins Handheld</option>
              <option value="ICARE">Icare Rebound</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition ${
              saved ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved' : saving ? 'Saving...' : 'Save IOP'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Right Eye OD */}
        <div className={`p-4 rounded-lg border ${isHighOD ? 'bg-red-50/50 border-red-300' : 'bg-emerald-50/40 border-emerald-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              OD (Right Eye)
            </span>
            {isHighOD && (
              <span className="flex items-center text-xs font-bold text-red-600 gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> High IOP (&gt;21 mmHg)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="text-xs text-slate-500 font-medium">Measured (mmHg)</label>
              <input
                type="number"
                value={iopOD}
                onChange={(e) => setIopOD(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded font-bold text-base text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Pachymetry / CCT (µm)</label>
              <input
                type="number"
                value={cctOD}
                onChange={(e) => setCctOD(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-slate-800"
                placeholder="545"
              />
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 flex justify-between">
            <span>CCT-Corrected IOP:</span>
            <span className={`font-bold ${isHighOD ? 'text-red-600 font-mono text-sm' : 'text-emerald-700'}`}>
              {correctedOD} mmHg
            </span>
          </div>
        </div>

        {/* Left Eye OS */}
        <div className={`p-4 rounded-lg border ${isHighOS ? 'bg-red-50/50 border-red-300' : 'bg-sky-50/40 border-sky-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
              OS (Left Eye)
            </span>
            {isHighOS && (
              <span className="flex items-center text-xs font-bold text-red-600 gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> High IOP (&gt;21 mmHg)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="text-xs text-slate-500 font-medium">Measured (mmHg)</label>
              <input
                type="number"
                value={iopOS}
                onChange={(e) => setIopOS(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded font-bold text-base text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Pachymetry / CCT (µm)</label>
              <input
                type="number"
                value={cctOS}
                onChange={(e) => setCctOS(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-slate-800"
                placeholder="545"
              />
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 flex justify-between">
            <span>CCT-Corrected IOP:</span>
            <span className={`font-bold ${isHighOS ? 'text-red-600 font-mono text-sm' : 'text-sky-700'}`}>
              {correctedOS} mmHg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
