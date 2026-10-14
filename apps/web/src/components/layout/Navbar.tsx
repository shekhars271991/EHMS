import React from 'react';
import { Eye, Users, FileText, Scissors, Moon, Sun, LogOut } from 'lucide-react';

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
  doctorName = 'Dr. Prajwal Kumar, MS',
  onLogout,
}) => {
  const navItems = [
    { id: 'queue', label: 'Queue & Triage', icon: Users },
    { id: 'encounter', label: 'Eye Exam Lane', icon: Eye },
    { id: 'surgery', label: 'Surgery & OT Suite', icon: Scissors },
    { id: 'prescriptions', label: 'Rx Pad & Print', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md no-print border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand: Lakshmi Aabha Eye Care */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('queue')}>
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-sky-500 rounded-lg shadow-sm">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Lakshmi Aabha <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">EYE CARE</span>
              </span>
              <p className="text-[11px] text-slate-400">Super-Specialty Ophthalmology Clinic</p>
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

            <div className="hidden sm:flex items-center space-x-2 text-right border-l border-slate-800 pl-3">
              <div>
                <p className="text-xs font-semibold text-white">{doctorName}</p>
                <p className="text-[10px] text-emerald-400">Chief Consultant Ophthalmologist</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                PK
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
