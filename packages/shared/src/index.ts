/**
 * Ophthalmology Electronic Medical Record (EHMS) Shared Types
 */

// 1. Core Clinical Enums
export type OcularSide = 'OD' | 'OS' | 'OU';

export type VisitStatus = 
  | 'REGISTERED'
  | 'OPTOMETRY_IN_PROGRESS'
  | 'DILATING'
  | 'DOCTOR_WAITING'
  | 'DOCTOR_EXAM'
  | 'INVESTIGATION'
  | 'BILLING'
  | 'COMPLETED'
  | 'CANCELLED';

export type UserRole = 
  | 'ADMIN'
  | 'OPHTHALMOLOGIST'
  | 'OPTOMETRIST'
  | 'NURSE'
  | 'COUNSELOR'
  | 'BILLING'
  | 'PHARMACIST'
  | 'PATIENT';

export type PaymentStatus = 'PENDING' | 'COMPLETE';

export type TonometryMethod = 'GOLDMANN' | 'NCT' | 'TONOPEN' | 'PERKINS' | 'ICARE';

export type AnaesthesiaType = 'TOPICAL' | 'PERIBULBAR' | 'RETROBULBAR' | 'SUBCONJUNCTIVAL' | 'GENERAL';

export type SurgeryStatus = 'SCHEDULED' | 'IN_PRE_OP' | 'IN_OT' | 'RECOVERY' | 'DISCHARGED' | 'CANCELLED';

// 2. Visual Acuity & Refraction
export interface EyeVisualAcuity {
  distanceUnaided?: string;   // e.g. "6/18"
  distancePinhole?: string;   // e.g. "6/9"
  distanceBestCorrected?: string; // e.g. "6/6"
  nearUnaided?: string;       // e.g. "N10"
  nearBestCorrected?: string; // e.g. "N6"
}

export interface VisualAcuityData {
  OD: EyeVisualAcuity;
  OS: EyeVisualAcuity;
}

export interface RefractionValues {
  sphere: number;      // e.g. -1.50
  cylinder: number;    // e.g. -0.75
  axis: number;        // 1 to 180 degrees
  add?: number;        // e.g. +2.00
  va?: string;         // e.g. "6/6"
  nearVa?: string;     // e.g. "N6"
}

export interface RefractionData {
  autorefract?: {
    OD: RefractionValues;
    OS: RefractionValues;
  };
  subjectiveAcceptance: {
    OD: RefractionValues;
    OS: RefractionValues;
    pdDistance?: number; // Pupillary Distance in mm (e.g. 63)
    pdNear?: number;     // e.g. 60
  };
}

// 3. Intraocular Pressure (IOP)
export interface IOPMeasurement {
  method: TonometryMethod;
  iopOD: number;          // mmHg
  iopOS: number;          // mmHg
  pachymetryOD?: number;  // Corneal thickness in microns (e.g. 545)
  pachymetryOS?: number;  // microns
  correctedOD?: number;   // Calculated based on pachymetry
  correctedOS?: number;
  measuredAt: string;     // ISO timestamp
  notes?: string;
}

// 4. Anterior Segment & Lens LOCS III
export interface LensLOCSIII {
  nuclearOpalescence: number; // NO: 0.1 to 6.9
  nuclearColor: number;       // NC: 0.1 to 6.9
  cortical: number;           // C: 0.1 to 5.9
  posteriorSubcapsular: number; // P: 0.1 to 5.9
}

export interface EyeAnteriorSegment {
  lidsAdnexa?: string;
  conjunctiva?: string;
  cornea?: string;
  anteriorChamber?: string; // depth, cells (0-4+), flare (0-4+)
  iris?: string;
  pupil?: string;           // size, shape, light reflex, RAPD
  lensType: 'CLEAR' | 'CATARACT' | 'PSEUDOPHAKIC' | 'APHAKIC';
  locsIII?: LensLOCSIII;
  iolDetails?: string;      // if pseudophakic (e.g. "PCIOL well centered")
}

export interface GonioscopyQuadrant {
  superior: number;  // Shaffer grade 0-4
  inferior: number;
  nasal: number;
  temporal: number;
  pigmentation?: string; // e.g. "2+"
  pasPresent?: boolean;  // Peripheral anterior synechiae
}

export interface GonioscopyData {
  OD: GonioscopyQuadrant;
  OS: GonioscopyQuadrant;
}

// 5. Posterior Segment / Dilated Fundus
export interface EyePosteriorSegment {
  media?: string;
  opticDisc: {
    margins: 'SHARP' | 'BLURRED';
    cdRatio: number; // Cup-to-disc ratio, e.g. 0.3, 0.7
    neuroretinalRim?: string;
    pallor?: boolean;
  };
  macula?: string;       // e.g. "Normal foveal reflex", "Drusen", "DME"
  vessels?: string;      // e.g. "Normal caliber", "AV nicking"
  periphery?: string;    // e.g. "Attached, flat 360", "Lattice degeneration"
  diabeticRetinopathy?: 'NONE' | 'MILD_NPDR' | 'MODERATE_NPDR' | 'SEVERE_NPDR' | 'PDR';
}

export interface OphthalmicExamData {
  anteriorSegment: {
    OD: EyeAnteriorSegment;
    OS: EyeAnteriorSegment;
  };
  gonioscopy?: GonioscopyData;
  posteriorSegment: {
    OD: EyePosteriorSegment;
    OS: EyePosteriorSegment;
  };
  canvasSketches?: {
    anteriorOD?: string; // Base64 PNG or SVG vector drawing
    anteriorOS?: string;
    posteriorOD?: string;
    posteriorOS?: string;
  };
}

// 6. Cataract Biometry & IOL Calculation
export interface BiometryData {
  axialLengthOD: number;      // mm (e.g. 23.45)
  axialLengthOS: number;
  k1OD: number;               // Diopters (e.g. 43.50)
  k2OD: number;               // (e.g. 44.25)
  k1OS: number;
  k2OS: number;
  chosenFormula: 'SRK_T' | 'BARRETT_UNIVERSAL_II' | 'HOFFER_Q' | 'HOLLADAY_1' | 'HAIGIS';
  targetRefraction: number;   // e.g. -0.25 D
  iolModel: string;           // e.g. "Alcon AcrySof IQ SN60WF"
  aConstant: number;          // e.g. 118.9
  calculatedIOLPower: number; // e.g. 21.5 D
}

// 7. WHO Ophthalmic Surgical Safety Checklist
export interface WHOSurgicalChecklist {
  patientIdentityConfirmed: boolean;
  surgicalSiteMarkedODorOS: boolean;
  consentFormVerified: boolean;
  dilationAdequate: boolean;
  iolPowerDoubleChecked: boolean;
  allergiesReviewed: boolean;
  antibioticProphylaxisGiven: boolean;
  anesthesiaSafetyCheckDone: boolean;
  signOutSutureAndIOLSerialLogged: boolean;
}

// 8. Ophthalmic Prescription Item
export interface PrescriptionItem {
  drugName: string;          // e.g. "Moxifloxacin 0.5% Eye Drops"
  eye: OcularSide;           // OD, OS, OU
  dosage: string;            // "1 drop"
  frequency: string;         // "TID (3 times/day)" | "QID (4 times/day)" | "1 hourly"
  duration: string;          // "14 days"
  specialInstructions?: string; // "Taper by 1 drop every 5 days"
}

// 9. Patient Demographic & Registration
export interface PatientEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface PatientSystemicHistory {
  diabetes: boolean;
  hypertension: boolean;
  cardiacHistory: boolean;
  asthma: boolean;
  bleedingDisorders: boolean;
  notes?: string;
}

export interface ColorVisionEye {
  platesCorrect?: number;
  platesTotal?: number;
  result: 'NORMAL' | 'DEFICIENT' | 'NOT_TESTED';
  deficiencyType?: 'PROTAN' | 'DEUTAN' | 'TRITAN' | 'UNSPECIFIED';
}

export interface ColorVisionData {
  testType: 'ISHIHARA' | 'FARNSWORTH' | 'OTHER';
  OD: ColorVisionEye;
  OS: ColorVisionEye;
  notes?: string;
}

export interface PatientProfile {
  id: string;
  patientId: string;
  refraction?: RefractionData & { vaData?: VisualAcuityData };
  colorVision?: ColorVisionData;
  intraocularPressure?: IOPMeasurement;
  slitBiomicroscopy?: OphthalmicExamData['anteriorSegment'];
  dilatedFundus?: OphthalmicExamData['posteriorSegment'];
  updatedAt: string;
}

export interface Patient {
  id: string;
  userId?: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  address?: string;
  allergies: string[];
  systemicHistory: PatientSystemicHistory;
  emergencyContact?: PatientEmergencyContact;
  profile?: PatientProfile;
  createdAt: string;
}

// 10. Queue / Encounter View
export interface ClinicQueueItem {
  encounterId: string;
  patientId: string;
  mrn: string;
  patientName: string;
  age: number;
  gender: string;
  status: VisitStatus;
  tokenNumber: number;
  dilatedAt?: string;
  assignedDoctorName?: string;
  assignedOptometristName?: string;
  arrivedAt: string;
}
