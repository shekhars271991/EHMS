const axios = require('axios');

async function testAllCRUDs() {
  console.log('🧪 Starting End-to-End PostgreSQL CRUD Verification...');
  const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

  // 1. LOGIN
  const loginRes = await api.post('/auth/login', {
    email: 'dr.patel@eyehospital.com',
    password: 'eyeClinic123!',
  });
  const token = loginRes.data.token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('✅ 1. Authenticated as:', loginRes.data.user.fullName);

  // 2. CREATE PATIENT
  const ptRes = await api.post('/patients', {
    firstName: 'Meera',
    lastName: 'Nair',
    dob: '1982-05-15',
    gender: 'FEMALE',
    phone: '+91 98999 12345',
    allergies: ['Latex'],
    systemicHistory: { diabetes: true, hypertension: false },
  });
  const patient = ptRes.data.patient;
  console.log('✅ 2. Created Patient in Postgres:', patient.mrn, patient.firstName, patient.lastName);

  // 3. CHECK-IN TO QUEUE
  const encRes = await api.post('/encounters/checkin', {
    patientId: patient.id,
    chiefComplaint: 'Severe photophobia and right corneal pain',
  });
  const encounter = encRes.data.encounter;
  console.log('✅ 3. Checked In To Queue: Token #', encounter.tokenNumber, 'Encounter ID:', encounter.id);

  // 4. ADVANCE QUEUE STATUS (DILATING)
  const statusRes = await api.patch(`/encounters/${encounter.id}/status`, {
    status: 'DILATING',
    dilationDrops: 'Tropicamide 0.8% + Phenylephrine 5%',
  });
  console.log('✅ 4. Updated Status in Postgres:', statusRes.data.encounter.status, 'Drops:', statusRes.data.encounter.dilationDrops);

  // 5. SAVE WORKUP / REFRACTION
  const refRes = await api.post(`/encounters/${encounter.id}/refraction`, {
    vaData: {
      OD: { distanceUnaided: '6/36', distancePinhole: '6/18' },
      OS: { distanceUnaided: '6/6', distancePinhole: '6/6' },
    },
    refractionData: {
      subjectiveAcceptance: {
        OD: { sphere: -2.0, cylinder: -1.0, axis: 90, va: '6/18' },
        OS: { sphere: 0, cylinder: 0, axis: 0, va: '6/6' },
        pdDistance: 62,
      },
    },
  });
  console.log('✅ 5. Saved Refraction in Postgres: ID', refRes.data.refraction.id);

  // 6. SAVE IOP (Tonometry)
  const iopRes = await api.post(`/encounters/${encounter.id}/iop`, {
    method: 'GOLDMANN',
    iopOD: 18.0,
    iopOS: 14.0,
    pachymetryOD: 530.0,
    pachymetryOS: 545.0,
  });
  console.log('✅ 6. Saved Tonometry in Postgres: OD', iopRes.data.iopRecord.iopOD, 'mmHg (Corrected:', iopRes.data.iopRecord.correctedOD, 'mmHg)');

  // 7. SAVE DOCTOR EXAM (Slit Lamp & Fundus)
  const examRes = await api.post(`/encounters/${encounter.id}/exam`, {
    anteriorSegment: {
      OD: {
        cornea: 'Paracentral epithelial defect 2x2mm with fluorescein uptake',
        anterior_chamber: 'Cells 1+, flare 1+',
        lens: { type: 'CLEAR' },
      },
      OS: { cornea: 'Clear', lens: { type: 'CLEAR' } },
    },
    posteriorSegment: {
      OD: { optic_disc: { margins: 'sharp', cd_ratio: 0.3 }, macula: 'Normal' },
      OS: { optic_disc: { margins: 'sharp', cd_ratio: 0.3 }, macula: 'Normal' },
    },
  });
  console.log('✅ 7. Saved Slit Lamp Exam in Postgres: ID', examRes.data.exam.id);

  // 8. CREATE OPHTHALMIC PRESCRIPTION
  const rxRes = await api.post('/prescriptions', {
    encounterId: encounter.id,
    items: [
      {
        drugName: 'Moxifloxacin 0.5% Eye Drops',
        eye: 'OD',
        dosage: '1 drop',
        frequency: '1 hourly',
        duration: '5 days',
        specialInstructions: 'For right eye corneal ulcer',
      },
      {
        drugName: 'Carboxymethylcellulose 0.5% Eye Drops',
        eye: 'OU',
        dosage: '1 drop',
        frequency: 'QID',
        duration: '14 days',
      },
    ],
    generalAdvice: 'Avoid rubbing eyes, wear protective shield',
  });
  console.log('✅ 8. Created Prescription in Postgres: Rx ID', rxRes.data.prescription.id, 'with', rxRes.data.prescription.items.length, 'medications');

  // 9. BOOK SURGERY & ATTACH BIOMETRY
  const surgRes = await api.post('/surgeries/booking', {
    patientId: patient.id,
    encounterId: encounter.id,
    procedureName: 'Corneal Collagen Cross-Linking (CXL)',
    eye: 'OD',
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    theatreRoom: 'OT-2',
    anaesthesiaType: 'TOPICAL',
    biometryData: {
      axialLengthOD: 23.10,
      k1OD: 45.00,
      k2OD: 46.50,
      targetRefraction: 0.0,
    },
  });
  console.log('✅ 9. Booked Surgery in Postgres: Surgery ID', surgRes.data.booking.id, surgRes.data.booking.procedureName);

  // 10. SIGN INFORMED CONSENT
  const consentRes = await api.post(`/surgeries/${surgRes.data.booking.id}/consent`, {
    signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  });
  console.log('✅ 10. Signed Digital Consent in Postgres: Signed?', consentRes.data.booking.consentSigned);

  // 11. FETCH FULL ENCOUNTER DETAILS (READ)
  const fullEncRes = await api.get(`/encounters/${encounter.id}`);
  console.log('✅ 11. Read Full Encounter Record from Postgres:');
  console.log('     - Patient:', fullEncRes.data.encounter.patient.mrn, fullEncRes.data.encounter.patient.firstName);
  console.log('     - Refraction Recorded:', !!fullEncRes.data.encounter.refraction);
  console.log('     - Tonometry Records Count:', fullEncRes.data.encounter.iopRecords.length);
  console.log('     - Slit Lamp Exam Recorded:', !!fullEncRes.data.encounter.exam);
  console.log('     - Prescriptions Count:', fullEncRes.data.encounter.prescriptions.length);
  console.log('     - Surgeries Count:', fullEncRes.data.encounter.surgeries.length);

  console.log('\n🎉 ALL OPHTHALMIC CRUD FLOWS FULLY VERIFIED AGAINST LOCAL POSTGRESQL!\n');
}

testAllCRUDs().catch((err) => {
  console.error('❌ CRUD Test Failure:', err.response?.data || err.message);
  process.exit(1);
});
