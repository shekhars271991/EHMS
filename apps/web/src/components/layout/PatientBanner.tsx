import React from 'react';
import { User, AlertTriangle, Clock, Eye, Activity, HeartPulse, MapPin } from 'lucide-react';

interface PatientBannerProps {
  patient: {
    mrn: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    address?: string;
    allergies: string[];
    systemic: { diabetes: boolean; hypertension: boolean };
    dilatedAt?: string;
    dilationDrops?: string;
    iopOD?: number;
    iopOS?: number;
  };
}

export const PatientBanner: React.FC<PatientBannerProps> = ({ patient }) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm no-print sticky top-16 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        {/* Patient Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
            <User className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-base">{patient.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                {patient.mrn}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <span>{patient.age}y / {patient.gender}</span>
              <span>•</span>
              <span>{patient.phone}</span>
              {patient.address && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 truncate max-w-[280px]" title={patient.address}>
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {patient.address}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Clinical Flags */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dilation Status Indicator */}
          {patient.dilatedAt ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>
                <strong>Dilated:</strong> {patient.dilatedAt} ({patient.dilationDrops || 'Tropi-P'})
              </span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs">
              Undilated
            </div>
          )}

          {/* IOP Preview */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-600">IOP:</span>
            <span className="font-semibold text-emerald-700">OD: {patient.iopOD || 15}</span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold text-sky-700">OS: {patient.iopOS || 14}</span>
            <span className="text-slate-400">mmHg</span>
          </div>

          {/* Systemic Flags */}
          <div className="flex items-center space-x-1 text-xs">
            {patient.systemic.diabetes && (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium flex items-center gap-1">
                <HeartPulse className="w-3 h-3 text-rose-500" /> DM
              </span>
            )}
            {patient.systemic.hypertension && (
              <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded font-medium flex items-center gap-1">
                <Activity className="w-3 h-3 text-orange-500" /> HTN
              </span>
            )}
          </div>

          {/* Allergies Alert */}
          {patient.allergies.length > 0 && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-red-100 border border-red-300 text-red-800 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>Allergy: {patient.allergies.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
