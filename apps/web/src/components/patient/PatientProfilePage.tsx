import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  CreditCard,
  Eye,
  FileText,
  ChevronLeft,
  Loader2,
  Plus,
  Scissors,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '../../api/client';
import { RefractionMatrix } from '../encounter/RefractionMatrix';
import { ColorVisionCard } from '../encounter/ColorVisionCard';
import { IOPCard } from '../encounter/IOPCard';
import { DualEyeExam } from '../encounter/DualEyeExam';
import { PrescriptionPad } from '../rx/PrescriptionPad';

interface PatientProfilePageProps {
  patientId: string;
  doctorName?: string;
  initialVisitId?: string;
}

export const PatientProfilePage: React.FC<PatientProfilePageProps> = ({
  patientId,
  doctorName,
  initialVisitId,
}) => {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'visits' | 'tests' | 'prescription'>('visits');
  const [visitType, setVisitType] = useState('FOLLOW_UP');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [creatingVisit, setCreatingVisit] = useState(false);
  const [activeVisitId, setActiveVisitId] = useState<string | null>(initialVisitId || null);
  const [rxVisitId, setRxVisitId] = useState<string | null>(null);
  const [paymentBusy, setPaymentBusy] = useState<string | null>(null);
  const [showSurgeryForm, setShowSurgeryForm] = useState(false);
  const [surgeryName, setSurgeryName] = useState('');
  const [surgeryDate, setSurgeryDate] = useState(() => {
    const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  });
  const [surgeryEye, setSurgeryEye] = useState('OD');
  const [savingSurgery, setSavingSurgery] = useState(false);
  const [deletingVisit, setDeletingVisit] = useState(false);

  const loadPatient = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getPatientById(patientId);
      setPatient(data);
      if (initialVisitId) {
        setActiveVisitId(initialVisitId);
        const visit = (data.encounters || []).find((item: any) => item.id === initialVisitId);
        if (visit?.paymentStatus === 'COMPLETE') setRxVisitId(initialVisitId);
      }
    } catch (err) {
      console.error('Failed to load patient profile', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const handleCreateVisit = async () => {
    setCreatingVisit(true);
    try {
      const visit = await api.checkIn(patientId, chiefComplaint || 'Outpatient consultation', visitType);
      setActiveVisitId(visit.id);
      setChiefComplaint('');
      setView('visits');
      await loadPatient();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setCreatingVisit(false);
    }
  };

  const handleMarkPaid = async (visitId: string) => {
    setPaymentBusy(visitId);
    try {
      await api.updateVisitPayment(visitId, 'COMPLETE', 'Offline payment at front desk');
      setActiveVisitId(visitId);
      setRxVisitId(visitId);
      setView('prescription');
      await loadPatient();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setPaymentBusy(null);
    }
  };

  const handleAddSurgery = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!surgeryName.trim() || !surgeryDate) return;
    setSavingSurgery(true);
    try {
      let encounter = visits.find((visit) => visit.id === activeVisitId) || visits[0];
      if (!encounter) {
        encounter = await api.checkIn(patientId, 'Surgery planning', 'NEW');
      }
      await api.bookSurgery({
        patientId,
        encounterId: encounter.id,
        procedureName: surgeryName.trim(),
        eye: surgeryEye,
        scheduledDate: new Date(surgeryDate).toISOString(),
        theatreRoom: 'OT-1',
        anaesthesiaType: 'TOPICAL',
      });
      setShowSurgeryForm(false);
      setSurgeryName('');
      alert('Surgery scheduled. View it in Surgery & OT.');
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Could not schedule surgery.');
    } finally {
      setSavingSurgery(false);
    }
  };

  const handleDeleteVisit = async () => {
    if (!rxVisitId || !window.confirm('Delete this visit? This will cancel it and it will remain in the visit history.')) return;
    setDeletingVisit(true);
    try {
      await api.cancelVisit(rxVisitId);
      setRxVisitId(null);
      setActiveVisitId(null);
      setView('visits');
      await loadPatient(true);
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Could not cancel visit.');
    } finally {
      setDeletingVisit(false);
    }
  };

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading patient profile...
      </div>
    );
  }

  const age = patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : '—';
  const visits: any[] = patient.encounters || [];
  const profile = patient.profile || {};
  const rxVisit = visits.find((v) => v.id === rxVisitId);
  const canWriteRx = rxVisit?.paymentStatus === 'COMPLETE' && rxVisit?.status !== 'CANCELLED';

  return (
    <div className="space-y-6">
      {view === 'visits' ? (
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Patient profile</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-sm text-slate-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span className="font-mono font-semibold text-slate-800">{patient.mrn}</span>
              <span>{age}y / {patient.gender}</span>
              <span>{patient.phone}</span>
              {patient.address && <span>{patient.address}</span>}
            </p>
            {patient.user?.id && (
              <p className="text-[11px] text-slate-400 mt-1">Linked user record · role PATIENT · MRN {patient.user.mrn || patient.mrn}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setView('tests')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 whitespace-nowrap"
            >
              <ClipboardList className="w-4 h-4" /> Clinical tests
            </button>
            <button
              type="button"
              onClick={() => setShowSurgeryForm(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-600 text-emerald-800 text-sm font-semibold hover:bg-emerald-50 whitespace-nowrap"
            >
              <Scissors className="w-4 h-4" /> Add surgery
            </button>
          </div>
        </div>
      </section>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div>
            <button type="button" onClick={() => setView('visits')} className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
              <ChevronLeft className="w-4 h-4" /> Back to visits
            </button>
            <p className="text-xs text-slate-500 mt-1">{patient.firstName} {patient.lastName} · {patient.mrn}</p>
          </div>
          <div className="sm:text-right">
            <h2 className="text-xl font-bold text-slate-900">{view === 'tests' ? 'Clinical tests' : 'Visit prescription'}</h2>
            {view === 'prescription' && doctorName && <p className="text-xs text-slate-500 mt-1">{doctorName}</p>}
          </div>
          {view === 'prescription' && rxVisit?.prescriptions?.length === 0 && (
            <button type="button" onClick={handleDeleteVisit} disabled={deletingVisit} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-300 text-rose-700 text-sm font-semibold hover:bg-rose-50 disabled:opacity-60">
              <Trash2 className="w-4 h-4" /> {deletingVisit ? 'Deleting...' : 'Delete visit'}
            </button>
          )}
        </div>
      )}

      {view === 'tests' && (
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              Clinical tests
            </h3>
            <p className="text-xs text-slate-500">
              Update refraction, color vision, intraocular pressure, slit biomicroscopy, and dilated fundus one by one.
            </p>
          </div>
          <RefractionMatrix patientId={patient.id} initialData={profile.refraction} />
          <ColorVisionCard patientId={patient.id} initialData={profile.colorVision} />
          <IOPCard patientId={patient.id} initialIOP={profile.intraocularPressure} />
          <DualEyeExam
            patientId={patient.id}
            section="slit"
            initialExam={profile.slitBiomicroscopy ? { anteriorSegment: profile.slitBiomicroscopy } : null}
          />
          <DualEyeExam
            patientId={patient.id}
            section="fundus"
            initialExam={profile.dilatedFundus ? { posteriorSegment: profile.dilatedFundus } : null}
          />
        </section>
      )}

      {view === 'visits' && <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Visits</h3>
        <p className="text-xs text-slate-500 mb-4">
          A patient may have multiple visits. After creating a visit, record offline payment, then write and print the prescription.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <select
            value={visitType}
            onChange={(e) => setVisitType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white"
          >
            <option value="NEW">New</option>
            <option value="FOLLOW_UP">Follow-up</option>
            <option value="POST_OP">Post-op</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
          <input
            type="text"
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="Chief complaint (optional)"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
          />
          <button
            type="button"
            onClick={handleCreateVisit}
            disabled={creatingVisit}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
          >
            {creatingVisit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create visit
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Complaint</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No visits yet. Create the first visit after reviewing tests.
                  </td>
                </tr>
              ) : (
                visits.map((visit) => (
                  <tr key={visit.id} className={visit.id === activeVisitId ? 'bg-emerald-50/40' : ''}>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {new Date(visit.visitDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3">{visit.visitType}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[220px] truncate">{visit.chiefComplaint || '—'}</td>
                    <td className="py-2.5 px-3">
                      {visit.status === 'CANCELLED' ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">Visit cancelled</span>
                      ) : visit.paymentStatus === 'COMPLETE' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                          Payment complete
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                          Payment pending
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2 whitespace-nowrap">
                      {visit.status !== 'CANCELLED' && visit.paymentStatus !== 'COMPLETE' && (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(visit.id)}
                          disabled={paymentBusy === visit.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-white font-medium"
                        >
                          <CreditCard className="w-3 h-3" />
                          {paymentBusy === visit.id ? 'Updating...' : 'Mark payment complete'}
                        </button>
                      )}
                      {visit.status !== 'CANCELLED' && visit.paymentStatus === 'COMPLETE' && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVisitId(visit.id);
                            setRxVisitId(visit.id);
                            setView('prescription');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white font-medium"
                        >
                          <FileText className="w-3 h-3" />
                          Prescription
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>}

      {view === 'prescription' && rxVisitId && canWriteRx && (
        <section>
          <PrescriptionPad
            key={rxVisitId}
            encounterId={rxVisitId}
            patientName={`${patient.firstName} ${patient.lastName}`}
            mrn={patient.mrn}
            allergies={patient.allergies || []}
            initialPrescriptions={rxVisit?.prescriptions}
            onSaved={() => loadPatient(true)}
          />
        </section>
      )}

      {showSurgeryForm && (
        <div className="fixed inset-0 z-[60] bg-slate-950/50 flex items-center justify-center p-4" role="presentation">
          <form onSubmit={handleAddSurgery} className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6" role="dialog" aria-modal="true" aria-labelledby="add-surgery-title">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">{patient.firstName} {patient.lastName} · {patient.mrn}</p>
                <h3 id="add-surgery-title" className="text-xl font-bold text-slate-900 mt-1">Schedule surgery</h3>
              </div>
              <button type="button" onClick={() => setShowSurgeryForm(false)} aria-label="Close" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Surgery / procedure</label>
                <input required value={surgeryName} onChange={(e) => setSurgeryName(e.target.value)} placeholder="Enter procedure name" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Date and time</label>
                  <input required type="datetime-local" value={surgeryDate} onChange={(e) => setSurgeryDate(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Eye</label>
                  <select value={surgeryEye} onChange={(e) => setSurgeryEye(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                    <option value="OD">OD · Right eye</option>
                    <option value="OS">OS · Left eye</option>
                    <option value="OU">OU · Both eyes</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowSurgeryForm(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700">Cancel</button>
              <button type="submit" disabled={savingSurgery} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60">{savingSurgery ? 'Scheduling...' : 'Schedule surgery'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
