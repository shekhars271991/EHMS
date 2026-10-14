import React, { useState, useEffect } from 'react';
import { Stethoscope, Sparkles, Save, Check } from 'lucide-react';
import { api } from '../../api/client';

interface DualEyeExamProps {
  encounterId?: string;
  patientId?: string;
  section?: 'all' | 'slit' | 'fundus';
  initialExam?: any;
}

export const DualEyeExam: React.FC<DualEyeExamProps> = ({
  encounterId,
  patientId,
  section = 'all',
  initialExam,
}) => {
  // Lens LOCS III state
  const [lensOD, setLensOD] = useState({
    type: 'CATARACT',
    no: 2.5,
    nc: 2.0,
    c: 0.5,
    p: 0.0,
  });

  const [lensOS, setLensOS] = useState({
    type: 'CLEAR',
    no: 0.0,
    nc: 0.0,
    c: 0.0,
    p: 0.0,
  });

  // Fundus state
  const [cdRatioOD, setCdRatioOD] = useState(0.3);
  const [cdRatioOS, setCdRatioOS] = useState(0.3);

  // Anterior Segment strings
  const [corneaOD, setCorneaOD] = useState('Clear, tear film normal');
  const [acOD, setAcOD] = useState('Deep & quiet, van Herick Gr 4');
  const [corneaOS, setCorneaOS] = useState('Clear, lustrous');
  const [acOS, setAcOS] = useState('Deep & quiet');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialExam) {
      if (initialExam.anteriorSegment?.OD?.lens?.locs_iii) {
        const l = initialExam.anteriorSegment.OD.lens.locs_iii;
        setLensOD({
          type: initialExam.anteriorSegment.OD.lens.type || 'CATARACT',
          no: l.NO || 2.5,
          nc: l.NC || 2.0,
          c: l.C || 0.5,
          p: l.P || 0.0,
        });
      }
      if (initialExam.posteriorSegment?.OD?.optic_disc?.cd_ratio) {
        setCdRatioOD(initialExam.posteriorSegment.OD.optic_disc.cd_ratio);
      }
      if (initialExam.posteriorSegment?.OS?.optic_disc?.cd_ratio) {
        setCdRatioOS(initialExam.posteriorSegment.OS.optic_disc.cd_ratio);
      }
    }
  }, [initialExam]);

  const applyCataractPreset = () => {
    setLensOD({ type: 'CATARACT', no: 2.5, nc: 2.0, c: 0.5, p: 0.0 });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const anteriorSegment = {
        OD: {
          cornea: corneaOD,
          anterior_chamber: acOD,
          lens: {
            type: lensOD.type,
            locs_iii: { NO: lensOD.no, NC: lensOD.nc, C: lensOD.c, P: lensOD.p },
          },
        },
        OS: {
          cornea: corneaOS,
          anterior_chamber: acOS,
          lens: { type: lensOS.type },
        },
      };

      const posteriorSegment = {
        OD: {
          optic_disc: { margins: 'sharp', cd_ratio: cdRatioOD },
          macula: 'Normal foveal reflex',
          periphery: 'Attached 360',
        },
        OS: {
          optic_disc: { margins: 'sharp', cd_ratio: cdRatioOS },
          macula: 'Normal',
          periphery: 'Normal',
        },
      };

      if (patientId) {
        if (section === 'slit') {
          await api.updatePatientProfile(patientId, { slitBiomicroscopy: anteriorSegment });
        } else if (section === 'fundus') {
          await api.updatePatientProfile(patientId, { dilatedFundus: posteriorSegment });
        } else {
          await api.updatePatientProfile(patientId, {
            slitBiomicroscopy: anteriorSegment,
            dilatedFundus: posteriorSegment,
          });
        }
      } else if (encounterId) {
        await api.saveExam(encounterId, { anteriorSegment, posteriorSegment });
      } else {
        throw new Error('No patient or visit selected');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save exam:', err);
      alert('Error saving exam: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="responsive-card bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
      <div className="clinical-card-header flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Stethoscope className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base">
            {section === 'slit'
              ? 'Slit biomicroscopy'
              : section === 'fundus'
              ? 'Dilated fundus'
              : 'Slit biomicroscopy & dilated fundus'}
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          {section !== 'fundus' && (
            <button
              onClick={applyCataractPreset}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Cataract preset</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition ${
              saved ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved' : saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Right Eye OD (Green Accent) */}
        <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/20">
          <div className="flex items-center justify-between mb-3 border-b border-emerald-200 pb-2">
            <span className="font-bold text-sm px-2.5 py-1 rounded bg-emerald-600 text-white">
              OD (Right Eye)
            </span>
            <span className="text-xs text-emerald-800 font-medium">
              {section === 'fundus' ? 'Posterior findings' : section === 'slit' ? 'Anterior findings' : 'Anterior & posterior'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {section !== 'fundus' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700">Cornea</label>
                <input
                  type="text"
                  value={corneaOD}
                  onChange={(e) => setCorneaOD(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Anterior Chamber</label>
                <input
                  type="text"
                  value={acOD}
                  onChange={(e) => setAcOD(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
            )}

            {section !== 'fundus' && (
            <div className="bg-white p-3 rounded border border-emerald-200 shadow-2xs">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800">Lens Status</span>
                <select
                  value={lensOD.type}
                  onChange={(e) => setLensOD({ ...lensOD, type: e.target.value })}
                  className="px-2 py-0.5 border border-slate-300 rounded font-semibold text-xs"
                >
                  <option value="CLEAR">Clear</option>
                  <option value="CATARACT">Cataract (LOCS III)</option>
                  <option value="PSEUDOPHAKIC">Pseudophakic (PCIOL)</option>
                  <option value="APHAKIC">Aphakic</option>
                </select>
              </div>

              {lensOD.type === 'CATARACT' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">NO (0-6)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={lensOD.no}
                      onChange={(e) => setLensOD({ ...lensOD, no: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-0.5 px-1.5 py-1 border border-slate-300 rounded text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">NC (0-6)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={lensOD.nc}
                      onChange={(e) => setLensOD({ ...lensOD, nc: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-0.5 px-1.5 py-1 border border-slate-300 rounded text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">C (0-5)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={lensOD.c}
                      onChange={(e) => setLensOD({ ...lensOD, c: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-0.5 px-1.5 py-1 border border-slate-300 rounded text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">P (0-5)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={lensOD.p}
                      onChange={(e) => setLensOD({ ...lensOD, p: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-0.5 px-1.5 py-1 border border-slate-300 rounded text-center font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
            )}

            {section !== 'slit' && (
            <div className="bg-white p-3 rounded border border-emerald-200">
              <span className="font-bold text-slate-800 block mb-2">Fundus Examination</span>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-slate-600 font-medium flex justify-between">
                    <span>Cup/Disc (C/D) Ratio:</span>
                    <strong className="text-emerald-700 font-mono">{cdRatioOD}</strong>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={cdRatioOD}
                    onChange={(e) => setCdRatioOD(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium">Optic Disc Margins</label>
                  <select className="w-full mt-1 px-2 py-1 border border-slate-300 rounded">
                    <option>Sharp & Well Defined</option>
                    <option>Blurred / Papilledema</option>
                    <option>Pale Disc</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-medium">Macula</label>
                  <input
                    type="text"
                    defaultValue="Normal foveal reflex"
                    className="w-full mt-1 px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium">Periphery</label>
                  <input
                    type="text"
                    defaultValue="Attached 360°, no breaks"
                    className="w-full mt-1 px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Left Eye OS (Blue Accent) */}
        <div className="border border-sky-200 rounded-lg p-4 bg-sky-50/20">
          <div className="flex items-center justify-between mb-3 border-b border-sky-200 pb-2">
            <span className="font-bold text-sm px-2.5 py-1 rounded bg-sky-600 text-white">
              OS (Left Eye)
            </span>
            <span className="text-xs text-sky-800 font-medium">
              {section === 'fundus' ? 'Posterior findings' : section === 'slit' ? 'Anterior findings' : 'Anterior & posterior'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {section !== 'fundus' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700">Cornea</label>
                <input
                  type="text"
                  value={corneaOS}
                  onChange={(e) => setCorneaOS(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Anterior Chamber</label>
                <input
                  type="text"
                  value={acOS}
                  onChange={(e) => setAcOS(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
            )}

            {section !== 'fundus' && (
            <div className="bg-white p-3 rounded border border-sky-200 shadow-2xs">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800">Lens Status</span>
                <select
                  value={lensOS.type}
                  onChange={(e) => setLensOS({ ...lensOS, type: e.target.value })}
                  className="px-2 py-0.5 border border-slate-300 rounded font-semibold text-xs"
                >
                  <option value="CLEAR">Clear</option>
                  <option value="CATARACT">Cataract (LOCS III)</option>
                  <option value="PSEUDOPHAKIC">Pseudophakic (PCIOL)</option>
                  <option value="APHAKIC">Aphakic</option>
                </select>
              </div>

              {lensOS.type === 'CATARACT' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">NO (0-6)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={lensOS.no}
                      onChange={(e) => setLensOS({ ...lensOS, no: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-0.5 px-1.5 py-1 border border-slate-300 rounded text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">NC (0-6)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={lensOS.nc}
                      onChange={(e) => setLensOS({ ...lensOS, nc: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-0.5 px-1.5 py-1 border border-slate-300 rounded text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">C (0-5)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={lensOS.c}
                      onChange={(e) => setLensOS({ ...lensOS, c: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-0.5 px-1.5 py-1 border border-slate-300 rounded text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">P (0-5)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={lensOS.p}
                      onChange={(e) => setLensOS({ ...lensOS, p: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-0.5 px-1.5 py-1 border border-slate-300 rounded text-center font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
            )}

            {section !== 'slit' && (
            <div className="bg-white p-3 rounded border border-sky-200">
              <span className="font-bold text-slate-800 block mb-2">Fundus Examination</span>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-slate-600 font-medium flex justify-between">
                    <span>Cup/Disc (C/D) Ratio:</span>
                    <strong className="text-sky-700 font-mono">{cdRatioOS}</strong>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={cdRatioOS}
                    onChange={(e) => setCdRatioOS(parseFloat(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium">Optic Disc Margins</label>
                  <select className="w-full mt-1 px-2 py-1 border border-slate-300 rounded">
                    <option>Sharp & Well Defined</option>
                    <option>Blurred</option>
                    <option>Pale Disc</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-medium">Macula</label>
                  <input
                    type="text"
                    defaultValue="Normal foveal reflex"
                    className="w-full mt-1 px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium">Periphery</label>
                  <input
                    type="text"
                    defaultValue="Attached 360°"
                    className="w-full mt-1 px-2 py-1 border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
