import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { PatientBanner } from './components/layout/PatientBanner';
import { QueueDesk } from './components/queue/QueueDesk';
import { RefractionMatrix } from './components/encounter/RefractionMatrix';
import { IOPCard } from './components/encounter/IOPCard';
import { DualEyeExam } from './components/encounter/DualEyeExam';
import { EyeCanvas } from './components/encounter/EyeCanvas';
import { SurgeryModule } from './components/surgery/SurgeryModule';
import { PrescriptionPad } from './components/rx/PrescriptionPad';
import { NewPatientModal } from './components/patient/NewPatientModal';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('encounter');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);

  interface ActivePatientState {
    mrn: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    allergies: string[];
    systemic: { diabetes: boolean; hypertension: boolean };
    dilatedAt?: string;
    dilationDrops?: string;
    iopOD?: number;
    iopOS?: number;
  }

  // Active patient in the doctor lane
  const [activePatient, setActivePatient] = useState<ActivePatientState>({
    mrn: 'EYE-2026-000101',
    name: 'Ramesh Kumar',
    age: 60,
    gender: 'MALE',
    phone: '+91 98111 22334',
    allergies: ['Ciprofloxacin'],
    systemic: { diabetes: true, hypertension: true },
    dilatedAt: '10:15 AM',
    dilationDrops: 'Tropicamide 0.8% + Phenylephrine 5%',
    iopOD: 15.2,
    iopOS: 14.1,
  });

  const handlePatientSelect = (_patientId: string) => {
    setCurrentTab('encounter');
  };

  const handleNewPatientRegistered = (newPt: any) => {
    setActivePatient({
      mrn: newPt.mrn,
      name: newPt.name,
      age: newPt.age,
      gender: newPt.gender,
      phone: newPt.phone,
      allergies: [],
      systemic: { diabetes: false, hypertension: false },
      iopOD: 15.0,
      iopOS: 15.0,
    });
    setCurrentTab('encounter');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Persistent sticky patient banner across clinical modules */}
      {currentTab !== 'queue' && <PatientBanner patient={activePatient} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Queue & Triage Desk */}
        {currentTab === 'queue' && (
          <QueueDesk
            onSelectPatient={handlePatientSelect}
            onOpenRegisterModal={() => setIsRegisterOpen(true)}
          />
        )}

        {/* Tab 2: Ophthalmic Clinic Encounter (Doctor Lane) */}
        {currentTab === 'encounter' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Ophthalmic Clinical Examination
                </h2>
                <p className="text-xs text-slate-500">
                  Dual-Eye OD / OS Evaluation, Refraction Matrix, Tonometry & Slit Lamp
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentTab('prescriptions')}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Go to Rx Pad →
                </button>
              </div>
            </div>

            {/* Visual Acuity & Manifest Refraction Table */}
            <RefractionMatrix />

            {/* Tonometry / Intraocular Pressure with Pachymetry Correction */}
            <IOPCard />

            {/* Slit Lamp Biomicroscopy & Fundus with LOCS III Cataract Grading */}
            <DualEyeExam />

            {/* Interactive Eye Sketch Canvases */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 no-print">
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Clinical Eye Diagram Annotator
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Sketch corneal ulcers, fluorescein pooling, lens opacities, or retinal tears directly on the eye diagram.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <EyeCanvas eye="OD" type="ANTERIOR" />
                <EyeCanvas eye="OS" type="ANTERIOR" />
                <EyeCanvas eye="OD" type="FUNDUS" />
                <EyeCanvas eye="OS" type="FUNDUS" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Surgery & OT Suite */}
        {currentTab === 'surgery' && <SurgeryModule />}

        {/* Tab 4: Prescription Pad & Printable Letterhead */}
        {currentTab === 'prescriptions' && <PrescriptionPad />}
      </main>

      {/* New Patient Registration Modal */}
      <NewPatientModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleNewPatientRegistered}
      />
    </div>
  );
};

export default App;
