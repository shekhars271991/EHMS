import React from 'react';
import { Eye, Users, FileText, Scissors, Moon, Sun, LogOut, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  doctorName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  doctorName = 'Dr. Prajjwal Kumar, MS',
  onLogout,
}) => {
  const navItems = [
    { id: 'directory', label: 'Patient Directory', icon: BookOpen },
    { id: 'queue', label: 'Queue & Triage', icon: Users },
    { id: 'encounter', label: 'Eye Exam Lane', icon: Eye },
    { id: 'surgery', label: 'Surgery & OT Suite', icon: Scissors },
    { id: 'prescriptions', label: 'Rx Pad & Print', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md no-print border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand: Lakshmi Abha Eye Care Wellness Center */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('queue')}>
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 border border-emerald-500/30 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/assets/clinic_logo.jpg"
                alt="Lakshmi Abha Eye Care Logo"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Lakshmi Abha <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono tracking-wider">WELLNESS CENTER</span>
              </span>
              <p className="text-[11px] text-slate-400 italic">"Your Vision Our Priority"</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User profile & Slit-lamp Dark Mode toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Slit-Lamp Dark Room Mode"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>

            <div className="hidden sm:flex items-center space-x-2.5 text-right border-l border-slate-800 pl-3">
              <div>
                <p className="text-xs font-semibold text-white">{doctorName}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Senior Retina Specialist</p>
              </div>
              <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0 bg-slate-800">
                <img
                  src="/assets/doctor_prajjwal.jpeg"
                  alt="Dr. Prajjwal Kumar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
