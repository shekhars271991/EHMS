import React, { useState, useRef } from 'react';
import { ShieldCheck, PenTool, CheckCircle, Calculator } from 'lucide-react';
import { WHOSurgicalChecklist } from '@ehms/shared';

export const SurgeryModule: React.FC = () => {
  // Biometry state
  const [axialLength, setAxialLength] = useState<number>(23.45);
  const [k1, setK1] = useState<number>(43.50);
  const [k2, setK2] = useState<number>(44.25);
  const [targetRefraction, setTargetRefraction] = useState<number>(-0.25);
  const [formula, setFormula] = useState<string>('BARRETT_UNIVERSAL_II');
  const [aConstant, setAConstant] = useState<number>(118.9);

  // WHO Safety Checklist state
  const [checklist, setChecklist] = useState<WHOSurgicalChecklist>({
    patientIdentityConfirmed: true,
    surgicalSiteMarkedODorOS: true,
    consentFormVerified: true,
    dilationAdequate: true,
    iolPowerDoubleChecked: true,
    allergiesReviewed: true,
    antibioticProphylaxisGiven: true,
    anesthesiaSafetyCheckDone: true,
    signOutSutureAndIOLSerialLogged: false,
  });

  // Simplified SRK/T approximation for instant clinical calculation preview:
  // P = A - 2.5 * AL - 0.9 * K
  const avgK = (k1 + k2) / 2;
  const approxIOLPower = Number((aConstant - 2.5 * axialLength - 0.9 * avgK - targetRefraction * 1.5).toFixed(1));

  // Digital Signature Pad state
  const [signatureDone, setSignatureDone] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);

  const startSigning = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    setIsSigning(true);
  };

  const sign = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSigning) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDone(false);
  };

  const toggleChecklistItem = (key: keyof WHOSurgicalChecklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Cataract Biometry & IOL Calculator */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">Cataract Biometry & IOL Calculation</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
            Eye: OD (Right Eye)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Axial Length AL (mm)</label>
              <input
                type="number"
                step="0.01"
                value={axialLength}
                onChange={(e) => setAxialLength(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">K1 (Diopters)</label>
                <input
                  type="number"
                  step="0.25"
                  value={k1}
                  onChange={(e) => setK1(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">K2 (Diopters)</label>
                <input
                  type="number"
                  step="0.25"
                  value={k2}
                  onChange={(e) => setK2(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Formula</label>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-xs font-medium bg-white"
              >
                <option value="BARRETT_UNIVERSAL_II">Barrett Universal II</option>
                <option value="SRK_T">SRK / T</option>
                <option value="HOFFER_Q">Hoffer Q</option>
                <option value="HOLLADAY_1">Holladay 1</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">A-Constant</label>
                <input
                  type="number"
                  step="0.1"
                  value={aConstant}
                  onChange={(e) => setAConstant(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Target Refraction</label>
                <input
                  type="number"
                  step="0.25"
                  value={targetRefraction}
                  onChange={(e) => setTargetRefraction(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-2 py-1.5 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* IOL Selected Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Calculated Emmetropic IOL Power
              </span>
              <div className="text-3xl font-extrabold text-emerald-900 mt-2 font-mono">
                +{approxIOLPower} D
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                Model: <strong>Alcon AcrySof IQ SN60WF</strong> (Monofocal Aspheric)
              </p>
            </div>
            <div className="text-[11px] text-emerald-800 bg-white/80 p-2 rounded border border-emerald-300 mt-3">
              Target Refraction: <strong>{targetRefraction} D</strong> | Average K: <strong>{avgK.toFixed(2)} D</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WHO Ophthalmic Surgical Safety Checklist */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-800 text-base">WHO Ophthalmic Surgical Safety Checklist (Sign-In)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            { key: 'patientIdentityConfirmed', label: '1. Patient identity confirmed with wristband & MRN' },
            { key: 'surgicalSiteMarkedODorOS', label: '2. Correct eye marked (OD Right Eye confirmed)' },
            { key: 'consentFormVerified', label: '3. Digital informed consent signed & on record' },
            { key: 'dilationAdequate', label: '4. Pupil dilation checked (adequate for phacoemulsification)' },
            { key: 'iolPowerDoubleChecked', label: `5. IOL power (+${approxIOLPower} D) verified against biometry` },
            { key: 'allergiesReviewed', label: '6. Allergy status reviewed (Patient allergic to Ciprofloxacin)' },
            { key: 'antibioticProphylaxisGiven', label: '7. Pre-op topical povidone-iodine & antibiotic given' },
            { key: 'anesthesiaSafetyCheckDone', label: '8. Anesthesia safety check & vitals completed' },
          ].map(({ key, label }) => {
            const isChecked = checklist[key as keyof WHOSurgicalChecklist];
            return (
              <div
                key={key}
                onClick={() => toggleChecklistItem(key as keyof WHOSurgicalChecklist)}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition ${
                  isChecked
                    ? 'bg-sky-50/50 border-sky-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center ${isChecked ? 'bg-sky-600 text-white' : 'border border-slate-300'}`}>
                  {isChecked && <CheckCircle className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Informed Consent & Touchscreen Signature Pad */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2 mb-2">
          <PenTool className="w-5 h-5 text-slate-700" />
          <h3 className="font-bold text-slate-800 text-base">Digital Surgical Consent Form</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          I consent to undergo <strong>Right Eye (OD) Phacoemulsification with Foldable Posterior Chamber IOL</strong>. Risks, benefits, and alternatives have been thoroughly explained by Dr. Anand Patel.
        </p>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 inline-block">
          <span className="text-xs font-semibold text-slate-700 block mb-1">Patient / Guardian Signature:</span>
          <div className="border border-dashed border-slate-300 bg-white rounded cursor-crosshair">
            <canvas
              ref={sigCanvasRef}
              width={380}
              height={120}
              onMouseDown={startSigning}
              onMouseMove={sign}
              onMouseUp={() => { setIsSigning(false); setSignatureDone(true); }}
              onMouseLeave={() => setIsSigning(false)}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[11px] text-slate-500">
              {signatureDone ? '✅ Signature recorded' : 'Please sign in the box above'}
            </span>
            <button
              onClick={clearSignature}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
