import React, { useState } from 'react';
import { Lock, Mail, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('dr.prajwal@lakshmiaabha.com');
  const [password, setPassword] = useState('EyeCare@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Invalid doctor email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('dr.prajwal@lakshmiaabha.com');
    setPassword('EyeCare@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Clinic Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white p-1.5 shadow-xl shadow-emerald-500/10 border-2 border-emerald-500/30 mb-3">
            <img
              src="/assets/clinic_logo.jpg"
              alt="Lakshmi Abha Eye Care Logo"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            LAKSHMI ABHA EYE CARE
          </h1>
          <p className="text-xs text-emerald-400 font-semibold tracking-wide uppercase mt-0.5">
            WELLNESS CENTER • "Your Vision Our Priority"
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Doctor Clinical Portal & Electronic Medical Records (EMR)
          </p>
        </div>

        {/* Doctor Spotlight Card */}
        <div className="mb-4 bg-slate-800/80 rounded-xl border border-slate-700/80 p-3 flex items-center space-x-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400 shrink-0 bg-slate-900 shadow">
            <img
              src="/assets/doctor_prajjwal.jpeg"
              alt="Dr. Prajjwal Kumar"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white truncate">Dr. Prajjwal Kumar, MS (Ophthalmology)</h3>
            <p className="text-[11px] text-emerald-400 font-medium">Senior Retina Specialist & Eye Surgeon</p>
            <p className="text-[10px] text-slate-400 truncate">Phone: +91 74080 89279 / +91 80890 91254</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Doctor Sign In</h2>
            <p className="text-xs text-slate-500">Access your live outpatient queue, exam lanes, and OT suite</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@lakshmiaabha.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                <span>Remember doctor session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-md shadow-emerald-600/30 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Clinical Suite</span>
              )}
            </button>
          </form>

          {/* Quick Doctor Account Selector */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium block mb-2 text-center uppercase tracking-wider">
              Testing Credentials
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fill: Dr. Prajjwal Kumar (Lakshmi Abha Eye Care)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Lakshmi Abha Eye Care Wellness Center • PostgreSQL 16 EMR
        </p>
      </div>
    </div>
  );
};
