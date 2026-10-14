import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Ophthalmology EMR Database...');

  const passwordHash = await bcrypt.hash('eyeClinic123!', 10);

  // 1. Create Staff Users (Lakshmi Abha Eye Care)
  const drPrajwalHash = await bcrypt.hash('EyeCare@2026', 10);
  const drPrajwal = await prisma.user.upsert({
    where: { email: 'dr.prajwal@lakshmiaabha.com' },
    update: {
      fullName: 'Dr. Prajjwal Kumar, MS (Ophthalmology)',
      passwordHash: drPrajwalHash,
      licenseNumber: 'KMC-OPH-54129',
      phone: '+91 74080 89279',
    },
    create: {
      email: 'dr.prajwal@lakshmiaabha.com',
      passwordHash: drPrajwalHash,
      fullName: 'Dr. Prajjwal Kumar, MS (Ophthalmology)',
      role: 'OPHTHALMOLOGIST',
      licenseNumber: 'KMC-OPH-54129',
      phone: '+91 74080 89279',
    },
  });

  const drPatel = await prisma.user.upsert({
    where: { email: 'dr.patel@eyehospital.com' },
    update: {},
    create: {
      email: 'dr.patel@eyehospital.com',
      passwordHash,
      fullName: 'Dr. Anand Patel, MS (Ophthalmology)',
      role: 'OPHTHALMOLOGIST',
      licenseNumber: 'MCI-OPH-88421',
      phone: '+91 98765 43210',
    },
  });

  const optomSharma = await prisma.user.upsert({
    where: { email: 'optom.sharma@eyehospital.com' },
    update: {},
    create: {
      email: 'optom.sharma@eyehospital.com',
      passwordHash,
      fullName: 'Pooja Sharma, B.Optom',
      role: 'OPTOMETRIST',
      licenseNumber: 'OPT-DEL-1029',
      phone: '+91 98765 11223',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@eyehospital.com' },
    update: {},
    create: {
      email: 'admin@eyehospital.com',
      passwordHash,
      fullName: 'System Administrator',
      role: 'ADMIN',
      phone: '+91 98765 99999',
    },
  });

  console.log('✅ Staff users created.');

  // 2. Create Sample Patients
  const patientRamesh = await prisma.patient.upsert({
    where: { mrn: 'EYE-2026-000101' },
    update: {},
    create: {
      mrn: 'EYE-2026-000101',
      firstName: 'Ramesh',
      lastName: 'Kumar',
      dob: new Date('1965-02-12'),
      gender: 'MALE',
      phone: '+91 98111 22334',
      idCard: { type: 'Aadhaar', number: 'XXXX-XXXX-1234' },
      emergencyContact: { name: 'Kavita Kumar', relation: 'Spouse', phone: '+91 98111 22335' },
      allergies: ['Ciprofloxacin'],
      systemicHistory: { diabetes: true, hypertension: true, cardiacHistory: false, asthma: false, bleedingDisorders: false },
    },
  });

  const patientSunita = await prisma.patient.upsert({
    where: { mrn: 'EYE-2026-000102' },
    update: {},
    create: {
      mrn: 'EYE-2026-000102',
      firstName: 'Sunita',
      lastName: 'Rao',
      dob: new Date('1974-06-25'),
      gender: 'FEMALE',
      phone: '+91 98222 33445',
      idCard: { type: 'Aadhaar', number: 'XXXX-XXXX-5678' },
      allergies: [],
      systemicHistory: { diabetes: false, hypertension: false, cardiacHistory: false, asthma: true, bleedingDisorders: false },
    },
  });

  console.log('✅ Patients created.');

  // 3. Create Sample Encounter for Ramesh (Senile Cataract Right Eye)
  const encounterRamesh = await prisma.encounter.create({
    data: {
      patientId: patientRamesh.id,
      doctorId: drPatel.id,
      optometristId: optomSharma.id,
      tokenNumber: 101,
      visitType: 'NEW',
      status: 'DOCTOR_EXAM',
      dilatedAt: new Date(),
      dilationDrops: 'Tropicamide 0.8% + Phenylephrine 5%',
      chiefComplaint: 'Diminution of vision in right eye since 3 months, glare at night',
      hpi: 'Gradual, painless, progressive loss of vision in right eye. No history of trauma or ocular surgery.',
      clinicalNotes: 'Scheduled for Phaco + IOL in Right Eye (OD).',
    },
  });

  // 4. Visual Acuity & Refraction
  await prisma.refraction.create({
    data: {
      encounterId: encounterRamesh.id,
      recordedById: optomSharma.id,
      vaData: {
        OD: { distanceUnaided: '6/24', distancePinhole: '6/12', nearUnaided: 'N12' },
        OS: { distanceUnaided: '6/6', distancePinhole: '6/6', nearUnaided: 'N6' },
      },
      refractionData: {
        autorefract: {
          OD: { sphere: -1.75, cylinder: -0.75, axis: 180 },
          OS: { sphere: -0.25, cylinder: 0.00, axis: 0 },
        },
        subjectiveAcceptance: {
          OD: { sphere: -1.50, cylinder: -0.75, axis: 180, add: 2.25, va: '6/12', nearVa: 'N8' },
          OS: { sphere: -0.25, cylinder: 0.00, axis: 0, add: 2.25, va: '6/6', nearVa: 'N6' },
          pdDistance: 63,
          pdNear: 60,
        },
      },
    },
  });

  // 5. IOP
  await prisma.iOPRecord.create({
    data: {
      encounterId: encounterRamesh.id,
      method: 'GOLDMANN',
      iopOD: 15.0,
      iopOS: 14.0,
      pachymetryOD: 540.0,
      pachymetryOS: 542.0,
      correctedOD: 15.2,
      correctedOS: 14.1,
      notes: 'Goldmann Applanation Tonometry at 10:45 AM',
    },
  });

  // 6. Doctor Slit Lamp & Fundus Exam
  await prisma.ophthalmicExam.create({
    data: {
      encounterId: encounterRamesh.id,
      doctorId: drPatel.id,
      anteriorSegment: {
        OD: {
          lids: 'Normal',
          conjunctiva: 'Quiet',
          cornea: 'Clear',
          anteriorChamber: 'Deep & quiet, van Herick Grade 4',
          iris: 'Normal pattern',
          pupil: 'Well dilated, round',
          lensType: 'CATARACT',
          locsIII: { nuclearOpalescence: 2.5, nuclearColor: 2.0, cortical: 0.5, posteriorSubcapsular: 0.0 },
        },
        OS: {
          cornea: 'Clear',
          anteriorChamber: 'Deep & quiet',
          lensType: 'CLEAR',
        },
      },
      gonioscopy: {
        OD: { superior: 4, inferior: 4, nasal: 4, temporal: 4, pigmentation: '1+' },
        OS: { superior: 4, inferior: 4, nasal: 4, temporal: 4, pigmentation: '1+' },
      },
      posteriorSegment: {
        OD: {
          media: 'Mild haze due to nuclear sclerosis',
          opticDisc: { margins: 'SHARP', cdRatio: 0.3, neuroretinalRim: 'healthy' },
          macula: 'Normal foveal reflex',
          vessels: 'Normal caliber',
          periphery: 'Attached 360, no tears',
        },
        OS: {
          media: 'Clear',
          opticDisc: { margins: 'SHARP', cdRatio: 0.3 },
          macula: 'Normal',
          periphery: 'Normal',
        },
      },
    },
  });

  // 7. Diagnosis
  await prisma.encounterDiagnosis.create({
    data: {
      encounterId: encounterRamesh.id,
      icd10Code: 'H25.9',
      diagnosisName: 'Senile cataract, unspecified',
      eye: 'OD',
      isPrimary: true,
    },
  });

  // 8. Surgical Booking with Biometry & IOL Calculation
  await prisma.surgicalBooking.create({
    data: {
      patientId: patientRamesh.id,
      encounterId: encounterRamesh.id,
      surgeonId: drPatel.id,
      procedureName: 'Phacoemulsification with Posterior Chamber IOL (OD)',
      eye: 'OD',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      theatreRoom: 'OT-1',
      anaesthesiaType: 'TOPICAL',
      biometryData: {
        axialLengthOD: 23.45,
        axialLengthOS: 23.40,
        k1OD: 43.50,
        k2OD: 44.25,
        chosenFormula: 'BARRETT_UNIVERSAL_II',
        targetRefraction: -0.25,
        iolModel: 'Alcon AcrySof IQ SN60WF',
        aConstant: 118.9,
        calculatedIOLPower: 21.5,
      },
      preOpChecklist: {
        patientIdentityConfirmed: true,
        surgicalSiteMarkedODorOS: true,
        consentFormVerified: false,
        dilationAdequate: true,
        iolPowerDoubleChecked: true,
        allergiesReviewed: true,
      },
    },
  });

  console.log('✅ Sample clinical encounter and cataract surgery booked.');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
