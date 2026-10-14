import React, { useState } from 'react';
import { Eye, ArrowRightLeft } from 'lucide-react';

export interface EyeRefractionState {
  sphere: number;
  cylinder: number;
  axis: number;
  add: number;
  distanceUnaided: string;
  distancePinhole: string;
  bcva: string;
  nearVa: string;
}

export const RefractionMatrix: React.FC = () => {
  const [od, setOd] = useState<EyeRefractionState>({
    sphere: -1.50,
    cylinder: -0.75,
    axis: 180,
    add: 2.25,
    distanceUnaided: '6/24',
    distancePinhole: '6/12',
    bcva: '6/12',
    nearVa: 'N8',
  });

  const [os, setOs] = useState<EyeRefractionState>({
    sphere: -0.25,
    cylinder: 0.00,
    axis: 0,
    add: 2.25,
    distanceUnaided: '6/6',
    distancePinhole: '6/6',
    bcva: '6/6',
    nearVa: 'N6',
  });

  const [pd, setPd] = useState(63);

  // Optical cylinder transposition algorithm:
  // New Sphere = Sphere + Cylinder
  // New Cylinder = -Cylinder
  // New Axis = (Axis + 90) % 180 (0 becomes 180)
  const transposeCylinder = (eye: 'OD' | 'OS') => {
    const target = eye === 'OD' ? od : os;
    const setTarget = eye === 'OD' ? setOd : setOs;

    if (target.cylinder === 0) return;

    const newSphere = Number((target.sphere + target.cylinder).toFixed(2));
    const newCyl = Number((-target.cylinder).toFixed(2));
    let newAxis = target.axis + 90;
    if (newAxis > 180) newAxis -= 180;

    setTarget({
      ...target,
      sphere: newSphere,
      cylinder: newCyl,
      axis: newAxis,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base">Visual Acuity & Manifest Refraction</h3>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">PD (mm):</span>
          <input
            type="number"
            value={pd}
            onChange={(e) => setPd(Number(e.target.value))}
            className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-slate-800"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <th className="py-2.5 px-3 font-semibold">Eye</th>
              <th className="py-2.5 px-3 font-semibold">Unaided VA</th>
              <th className="py-2.5 px-3 font-semibold">Pinhole</th>
              <th className="py-2.5 px-3 font-semibold">Sphere (D)</th>
              <th className="py-2.5 px-3 font-semibold">Cylinder (D)</th>
              <th className="py-2.5 px-3 font-semibold">Axis (°)</th>
              <th className="py-2.5 px-3 font-semibold">Add (D)</th>
              <th className="py-2.5 px-3 font-semibold">BCVA</th>
              <th className="py-2.5 px-3 font-semibold">Near VA</th>
              <th className="py-2.5 px-2 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* OD - Right Eye (Green) */}
            <tr className="hover:bg-emerald-50/30 transition-colors">
              <td className="py-3 px-3">
                <span className="inline-flex items-center justify-center px-2 py-1 font-bold text-xs rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  OD (Right)
                </span>
              </td>
              <td className="py-2 px-2">
                <input
                  type="text"
                  value={od.distanceUnaided}
                  onChange={(e) => setOd({ ...od, distanceUnaided: e.target.value })}
                  className="w-20 px-2 py-1 border border-slate-200 rounded text-center focus:ring-1 focus:ring-emerald-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="text"
                  value={od.distancePinhole}
                  onChange={(e) => setOd({ ...od, distancePinhole: e.target.value })}
                  className="w-20 px-2 py-1 border border-slate-200 rounded text-center focus:ring-1 focus:ring-emerald-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  step="0.25"
                  value={od.sphere}
                  onChange={(e) => setOd({ ...od, sphere: parseFloat(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-slate-200 rounded text-center font-mono font-medium focus:ring-1 focus:ring-emerald-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  step="0.25"
                  value={od.cylinder}
                  onChange={(e) => setOd({ ...od, cylinder: parseFloat(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-slate-200 rounded text-center font-mono font-medium focus:ring-1 focus:ring-emerald-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={od.axis}
                  onChange={(e) => setOd({ ...od, axis: parseInt(e.target.value) || 0 })}
                  className="w-16 px-2 py-1 border border-slate-200 rounded text-center font-mono font-medium focus:ring-1 focus:ring-emerald-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  step="0.25"
                  value={od.add}
                  onChange={(e) => setOd({ ...od, add: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-2 py-1 border border-slate-200 rounded text-center font-mono font-medium focus:ring-1 focus:ring-emerald-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="text"
                  value={od.bcva}
                  onChange={(e) => setOd({ ...od, bcva: e.target.value })}
                  className="w-20 px-2 py-1 border border-emerald-300 bg-emerald-50/50 font-bold text-emerald-900 rounded text-center"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="text"
                  value={od.nearVa}
                  onChange={(e) => setOd({ ...od, nearVa: e.target.value })}
                  className="w-16 px-2 py-1 border border-slate-200 rounded text-center"
                />
              </td>
              <td className="py-2 px-2 text-center">
                <button
                  type="button"
                  onClick={() => transposeCylinder('OD')}
                  title="Transpose Cylinder (+/-)"
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </td>
            </tr>

            {/* OS - Left Eye (Blue) */}
            <tr className="hover:bg-sky-50/30 transition-colors">
              <td className="py-3 px-3">
                <span className="inline-flex items-center justify-center px-2 py-1 font-bold text-xs rounded bg-sky-100 text-sky-800 border border-sky-300">
                  OS (Left)
                </span>
              </td>
              <td className="py-2 px-2">
                <input
                  type="text"
                  value={os.distanceUnaided}
                  onChange={(e) => setOs({ ...os, distanceUnaided: e.target.value })}
                  className="w-20 px-2 py-1 border border-slate-200 rounded text-center focus:ring-1 focus:ring-sky-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="text"
                  value={os.distancePinhole}
                  onChange={(e) => setOs({ ...os, distancePinhole: e.target.value })}
                  className="w-20 px-2 py-1 border border-slate-200 rounded text-center focus:ring-1 focus:ring-sky-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  step="0.25"
                  value={os.sphere}
                  onChange={(e) => setOs({ ...os, sphere: parseFloat(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-slate-200 rounded text-center font-mono font-medium focus:ring-1 focus:ring-sky-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  step="0.25"
                  value={os.cylinder}
                  onChange={(e) => setOs({ ...os, cylinder: parseFloat(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-slate-200 rounded text-center font-mono font-medium focus:ring-1 focus:ring-sky-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={os.axis}
                  onChange={(e) => setOs({ ...os, axis: parseInt(e.target.value) || 0 })}
                  className="w-16 px-2 py-1 border border-slate-200 rounded text-center font-mono font-medium focus:ring-1 focus:ring-sky-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  step="0.25"
                  value={os.add}
                  onChange={(e) => setOs({ ...os, add: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-2 py-1 border border-slate-200 rounded text-center font-mono font-medium focus:ring-1 focus:ring-sky-500"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="text"
                  value={os.bcva}
                  onChange={(e) => setOs({ ...os, bcva: e.target.value })}
                  className="w-20 px-2 py-1 border border-sky-300 bg-sky-50/50 font-bold text-sky-900 rounded text-center"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="text"
                  value={os.nearVa}
                  onChange={(e) => setOs({ ...os, nearVa: e.target.value })}
                  className="w-16 px-2 py-1 border border-slate-200 rounded text-center"
                />
              </td>
              <td className="py-2 px-2 text-center">
                <button
                  type="button"
                  onClick={() => transposeCylinder('OS')}
                  title="Transpose Cylinder (+/-)"
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-sky-700 transition"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
