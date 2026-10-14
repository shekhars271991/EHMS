import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { PatientBanner } from './components/layout/PatientBanner';
import { QueueDesk } from './components/queue/QueueDesk';
import { SurgeryModule } from './components/surgery/SurgeryModule';
import { NewPatientModal } from './components/patient/NewPatientModal';
import { PatientDirectory } from './components/patient/PatientDirectory';
import { PatientProfilePage } from './components/patient/PatientProfilePage';
import { LoginPage } from './components/auth/LoginPage';
import { api } from './api/client';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const cached = localStorage.getItem('ehms_user');
    return cached ? JSON.parse(cached) : null;
  });

  const [currentTab, setCurrentTab] = useState<string>('directory');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [activePatientId, setActivePatientId] = useState<string>('');
  const [activeVisitId, setActiveVisitId] = useState<string>('');
  const [bannerPatient, setBannerPatient] = useState<{
    mrn: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    address?: string;
    allergies: string[];
    systemic: { diabetes: boolean; hypertension: boolean };
  } | null>(null);

  const handleLoginSuccess = (user: any) => {
    localStorage.setItem('ehms_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('ehms_token');
    localStorage.removeItem('ehms_user');
    setCurrentUser(null);
  };

  const openPatientProfile = async (patientId: string, visitId?: string) => {
    setActivePatientId(patientId);
    setActiveVisitId(visitId || '');
    setCurrentTab('profile');
    try {
      const pt = await api.getPatientById(patientId);
      const birthYear = pt.dob ? new Date(pt.dob).getFullYear() : 1970;
      setBannerPatient({
        mrn: pt.mrn,
        name: `${pt.firstName} ${pt.lastName}`,
        age: new Date().getFullYear() - birthYear,
        gender: pt.gender,
        phone: pt.phone,
        address: pt.address || undefined,
        allergies: (pt.allergies as string[]) || [],
        systemic: pt.systemicHistory || { diabetes: false, hypertension: false },
      });
    } catch (err) {
      console.error('Error loading patient', err);
    }
  };

  const handleNewPatientRegistered = (patient: any) => {
    openPatientProfile(patient.id);
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

      {currentTab !== 'queue' && currentTab !== 'directory' && bannerPatient && (
        <PatientBanner patient={bannerPatient} />
      )}

      <main className="app-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentTab === 'directory' && (
          <PatientDirectory
            onSelectPatient={openPatientProfile}
            onOpenRegisterModal={() => setIsRegisterOpen(true)}
          />
        )}

        {currentTab === 'profile' && activePatientId && (
          <PatientProfilePage
            patientId={activePatientId}
            doctorName={currentUser.fullName}
            initialVisitId={activeVisitId || undefined}
          />
        )}

        {currentTab === 'profile' && !activePatientId && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
            Search for a patient in Patients to open their profile.
          </div>
        )}

        {currentTab === 'queue' && (
          <QueueDesk
            onSelectPatient={(patientId, visitId) => openPatientProfile(patientId, visitId)}
            onOpenRegisterModal={() => setIsRegisterOpen(true)}
          />
        )}

        {currentTab === 'surgery' && (
          <SurgeryModule />
        )}
      </main>

      <NewPatientModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleNewPatientRegistered}
      />
    </div>
  );
};

export default App;
