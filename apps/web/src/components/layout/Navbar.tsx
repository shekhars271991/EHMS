import React, { useEffect, useRef, useState } from 'react';
import { Scissors, Moon, Sun, LogOut, BookOpen, Menu, Clock } from 'lucide-react';

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
  doctorName = 'Doctor',
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const primaryItems = [
    { id: 'directory', label: 'Patients', icon: BookOpen },
    { id: 'queue', label: "Today's visits", icon: Clock },
  ];

  const moreItems = [
    { id: 'surgery', label: 'Surgery & OT', icon: Scissors },
  ];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md no-print border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center space-x-3 cursor-pointer min-w-0" onClick={() => setCurrentTab('directory')}>
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
            <div className="min-w-0 hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-white">Lakshmi Abha Eye Care</span>
              <p className="text-[11px] text-slate-400 italic truncate">Your Vision Our Priority</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (item.id === 'directory' && currentTab === 'profile');
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
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === 'surgery'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline">More</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-lg border border-slate-700 bg-slate-900 shadow-xl py-1 z-50">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCurrentTab(item.id);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle dark mode"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>

            <div className="hidden md:block text-right border-l border-slate-800 pl-3">
              <p className="text-xs font-semibold text-white truncate max-w-[160px]">{doctorName}</p>
              <p className="text-[10px] text-emerald-400 font-medium">Clinic staff</p>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out"
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
