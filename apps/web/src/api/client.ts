import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically authenticate as Dr. Patel for seamless dev experience
let authToken = localStorage.getItem('ehms_token');

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('ehms_token', token);
};

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Comprehensive API Endpoints for Ophthalmology EMR
export const api = {
  // 1. Auth
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.token) {
      setAuthToken(res.data.token);
    }
    return res.data;
  },

  // 2. Patients CRUD
  getPatients: async (search?: string) => {
    const res = await apiClient.get('/patients', { params: { search } });
    return res.data.patients;
  },
  getPatientById: async (id: string) => {
    const res = await apiClient.get(`/patients/${id}`);
    return res.data.patient;
  },
  createPatient: async (data: any) => {
    const res = await apiClient.post('/patients', data);
    return res.data.patient;
  },
  updatePatientProfile: async (patientId: string, fields: Record<string, unknown>) => {
    const res = await apiClient.patch(`/patients/${patientId}/profile`, fields);
    return res.data.profile;
  },
  updateVisitPayment: async (encounterId: string, paymentStatus: 'PENDING' | 'COMPLETE', paymentNote?: string) => {
    const res = await apiClient.patch(`/encounters/${encounterId}/payment`, {
      paymentStatus,
      paymentNote,
    });
    return res.data.encounter;
  },
  cancelVisit: async (encounterId: string) => {
    const res = await apiClient.patch(`/encounters/${encounterId}/cancel`);
    return res.data.encounter;
  },

  // 3. Queue & Encounters CRUD
  getQueue: async () => {
    const res = await apiClient.get('/encounters/queue/live');
    return res.data.encounters;
  },
  checkIn: async (patientId: string, chiefComplaint?: string, visitType = 'NEW') => {
    const res = await apiClient.post('/encounters/checkin', {
      patientId,
      chiefComplaint,
      visitType,
    });
    return res.data.encounter;
  },
  updateEncounterStatus: async (encounterId: string, status: string, dilationDrops?: string) => {
    const res = await apiClient.patch(`/encounters/${encounterId}/status`, {
      status,
      dilationDrops,
    });
    return res.data.encounter;
  },
  getEncounterDetails: async (encounterId: string) => {
    const res = await apiClient.get(`/encounters/${encounterId}`);
    return res.data.encounter;
  },

  // 4. Clinical Exam CRUD (Workup, Refraction, IOP, Slit-Lamp, Fundus)
  saveRefraction: async (encounterId: string, vaData: any, refractionData: any) => {
    const res = await apiClient.post(`/encounters/${encounterId}/refraction`, {
      vaData,
      refractionData,
    });
    return res.data.refraction;
  },
  saveIOP: async (encounterId: string, iopPayload: any) => {
    const res = await apiClient.post(`/encounters/${encounterId}/iop`, iopPayload);
    return res.data.iopRecord;
  },
  saveExam: async (encounterId: string, examPayload: any) => {
    const res = await apiClient.post(`/encounters/${encounterId}/exam`, examPayload);
    return res.data.exam;
  },
  addDiagnosis: async (encounterId: string, diagnosisPayload: any) => {
    const res = await apiClient.post(`/encounters/${encounterId}/diagnoses`, diagnosisPayload);
    return res.data.diagnosis;
  },

  // 5. Prescriptions CRUD
  createPrescription: async (encounterId: string, items: any[], generalAdvice?: string) => {
    const res = await apiClient.post('/prescriptions', {
      encounterId,
      items,
      generalAdvice,
    });
    return res.data.prescription;
  },
  getPrescriptions: async (encounterId: string) => {
    const res = await apiClient.get(`/prescriptions/encounter/${encounterId}`);
    return res.data.prescriptions;
  },

  // 6. Surgery & OT Suite CRUD
  getSurgeries: async () => {
    const res = await apiClient.get('/surgeries');
    return res.data.bookings;
  },
  bookSurgery: async (bookingData: any) => {
    const res = await apiClient.post('/surgeries/booking', bookingData);
    return res.data.booking;
  },
  signConsent: async (surgeryId: string, signatureDataUrl: string) => {
    const res = await apiClient.post(`/surgeries/${surgeryId}/consent`, {
      signatureDataUrl,
    });
    return res.data.booking;
  },
  updateChecklist: async (surgeryId: string, preOpChecklist: any) => {
    const res = await apiClient.patch(`/surgeries/${surgeryId}/checklist`, {
      preOpChecklist,
    });
    return res.data.booking;
  },
};
