import React, { useState, useEffect } from 'react';
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
import { LoginPage } from './components/auth/LoginPage';
import { api } from './api/client';

export const App: React.FC = () => {
  // Doctor Auth State
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const cached = localStorage.getItem('ehms_user');
    return cached ? JSON.parse(cached) : null;
  });

  const [currentTab, setCurrentTab] = useState<string>('encounter');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);

  // Active Encounter & Patient State from PostgreSQL
  const [activeEncounterId, setActiveEncounterId] = useState<string>('');
  const [activePatientId, setActivePatientId] = useState<string>('');
  const [encounterData, setEncounterData] = useState<any>(null);

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

  // Fetch initial queue when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    const initApp = async () => {
      try {
        const queue = await api.getQueue();
        if (queue && queue.length > 0) {
          loadEncounter(queue[0].id);
        }
      } catch (err) {
        console.error('Initial load error:', err);
      }
    };
    initApp();
  }, [currentUser]);

  const handleLoginSuccess = (user: any) => {
    localStorage.setItem('ehms_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('ehms_token');
    localStorage.removeItem('ehms_user');
    setCurrentUser(null);
  };

  const loadEncounter = async (encounterId: string) => {
    try {
      const enc = await api.getEncounterDetails(encounterId);
      if (enc) {
        setActiveEncounterId(enc.id);
        setActivePatientId(enc.patient.id);
        setEncounterData(enc);

        const birthYear = enc.patient.dob ? new Date(enc.patient.dob).getFullYear() : 1970;
        const latestIop = enc.iopRecords?.[0];

        setActivePatient({
          mrn: enc.patient.mrn,
          name: `${enc.patient.firstName} ${enc.patient.lastName}`,
          age: new Date().getFullYear() - birthYear,
          gender: enc.patient.gender,
          phone: enc.patient.phone,
          allergies: (enc.patient.allergies as string[]) || [],
          systemic: enc.patient.systemicHistory || { diabetes: false, hypertension: false },
          dilatedAt: enc.dilatedAt ? new Date(enc.dilatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          dilationDrops: enc.dilationDrops,
          iopOD: latestIop ? Number(latestIop.iopOD) : 15.0,
          iopOS: latestIop ? Number(latestIop.iopOS) : 14.0,
        });
      }
    } catch (err) {
      console.error('Error loading encounter from Postgres:', err);
    }
  };

  const handlePatientSelect = (encounterId: string) => {
    loadEncounter(encounterId);
    setCurrentTab('encounter');
  };

  const handleNewPatientRegistered = (newEncounter: any) => {
    loadEncounter(newEncounter.id);
    setCurrentTab('encounter');
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        doctorName={currentUser.fullName}
        onLogout={handleLogout}
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Ophthalmic Clinical Examination</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-normal">
                    PostgreSQL Connected
                  </span>
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
            <RefractionMatrix
              encounterId={activeEncounterId}
              initialData={encounterData?.refraction}
            />

            {/* Tonometry / Intraocular Pressure with Pachymetry Correction */}
            <IOPCard
              encounterId={activeEncounterId}
              initialIOP={encounterData?.iopRecords?.[0]}
            />

            {/* Slit Lamp Biomicroscopy & Fundus with LOCS III Cataract Grading */}
            <DualEyeExam
              encounterId={activeEncounterId}
              initialExam={encounterData?.exam}
            />

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
        {currentTab === 'surgery' && (
          <SurgeryModule
            patientId={activePatientId}
            encounterId={activeEncounterId}
            initialBooking={encounterData?.surgeries?.[0]}
          />
        )}

        {/* Tab 4: Prescription Pad & Printable Letterhead */}
        {currentTab === 'prescriptions' && (
          <PrescriptionPad
            encounterId={activeEncounterId}
            patientName={activePatient.name}
            mrn={activePatient.mrn}
            allergies={activePatient.allergies}
            initialPrescriptions={encounterData?.prescriptions}
          />
        )}
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
