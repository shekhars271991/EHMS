import React, { useState } from 'react';
import { Stethoscope, Sparkles } from 'lucide-react';

export const DualEyeExam: React.FC = () => {
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

  // Quick Preset Macros
  const applyCataractPreset = () => {
    setLensOD({ type: 'CATARACT', no: 2.5, nc: 2.0, c: 0.5, p: 0.0 });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Stethoscope className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base">Slit Lamp Biomicroscopy & Dilated Fundus</h3>
        </div>

        {/* Quick Macros */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Quick Template:</span>
          <button
            onClick={applyCataractPreset}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Cataract Workup</span>
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
            <span className="text-xs text-emerald-800 font-medium">Anterior & Posterior Findings</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Cornea & Anterior Chamber */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700">Cornea</label>
                <input
                  type="text"
                  defaultValue="Clear, tear film normal"
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Anterior Chamber</label>
                <input
                  type="text"
                  defaultValue="Deep & quiet, van Herick Gr 4"
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>

            {/* Lens & LOCS III Cataract Grading */}
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
                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100">
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

            {/* Posterior Segment / Optic Disc */}
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
          </div>
        </div>

        {/* Left Eye OS (Blue Accent) */}
        <div className="border border-sky-200 rounded-lg p-4 bg-sky-50/20">
          <div className="flex items-center justify-between mb-3 border-b border-sky-200 pb-2">
            <span className="font-bold text-sm px-2.5 py-1 rounded bg-sky-600 text-white">
              OS (Left Eye)
            </span>
            <span className="text-xs text-sky-800 font-medium">Anterior & Posterior Findings</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Cornea & Anterior Chamber */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700">Cornea</label>
                <input
                  type="text"
                  defaultValue="Clear, lustrous"
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Anterior Chamber</label>
                <input
                  type="text"
                  defaultValue="Deep & quiet"
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>

            {/* Lens & LOCS III */}
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
                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100">
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

            {/* Posterior Segment / Optic Disc */}
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
          </div>
        </div>
      </div>
    </div>
  );
};
