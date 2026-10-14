import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { VisitStatus } from '@ehms/shared';

export class EncounterController {
  // 1. Live Clinic Queue
  static async getQueue(req: AuthenticatedRequest, res: Response) {
    try {
      const now = new Date();
      const localDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(now);
      const [year, month, day] = localDate.split('-').map(Number);
      const today = new Date(Date.UTC(year, month - 1, day) - 330 * 60 * 1000);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const encounters = await prisma.encounter.findMany({
        where: {
          visitDate: { gte: today, lt: tomorrow },
          status: { not: 'CANCELLED' },
        },
        include: {
          patient: true,
          prescriptions: { select: { id: true }, take: 1 },
          doctor: { select: { fullName: true } },
          optometrist: { select: { fullName: true } },
        },
        orderBy: { tokenNumber: 'asc' },
      });

      return res.json({ encounters });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. Create Encounter (Check-in)
  static async checkIn(req: AuthenticatedRequest, res: Response) {
    try {
      const { patientId, visitType, doctorId, optometristId, chiefComplaint } = req.body;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const countToday = await prisma.encounter.count({
        where: { visitDate: { gte: today } },
      });

      const encounter = await prisma.encounter.create({
        data: {
          patientId,
          tokenNumber: countToday + 1,
          visitType: visitType || 'NEW',
          doctorId: doctorId || null,
          optometristId: optometristId || null,
          chiefComplaint: chiefComplaint || null,
          status: 'REGISTERED',
        },
        include: { patient: true },
      });

      return res.status(201).json({ encounter });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. Update Encounter Queue Status (e.g. Set to Dilating with drops)
  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, dilationDrops } = req.body;

      const updateData: any = { status: status as VisitStatus };
      if (status === 'DILATING') {
        updateData.dilatedAt = new Date();
        if (dilationDrops) updateData.dilationDrops = dilationDrops;
      }

      const encounter = await prisma.encounter.update({
        where: { id },
        data: updateData,
        include: { patient: true },
      });

      return res.json({ encounter });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async updatePayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { paymentStatus, paymentNote } = req.body;

      if (!['PENDING', 'COMPLETE'].includes(paymentStatus)) {
        return res.status(400).json({ error: 'paymentStatus must be PENDING or COMPLETE' });
      }

      const encounter = await prisma.encounter.update({
        where: { id },
        data: {
          paymentStatus,
          paymentNote: paymentNote || null,
          paymentCompletedAt: paymentStatus === 'COMPLETE' ? new Date() : null,
        },
        include: {
          patient: true,
          prescriptions: { include: { items: true } },
        },
      });

      return res.json({ encounter });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async cancelVisit(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const encounter = await prisma.encounter.findUnique({
        where: { id },
        include: { prescriptions: { select: { id: true }, take: 1 } },
      });

      if (!encounter) return res.status(404).json({ error: 'Visit not found' });
      if (encounter.prescriptions.length > 0) {
        return res.status(409).json({ error: 'A visit with a saved prescription cannot be deleted.' });
      }
      if (encounter.status === 'CANCELLED') {
        return res.status(409).json({ error: 'This visit is already cancelled.' });
      }

      const cancelled = await prisma.encounter.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
      return res.json({ encounter: cancelled });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 4. Get Full Clinical Encounter Details
  static async getEncounterDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const encounter = await prisma.encounter.findUnique({
        where: { id },
        include: {
          patient: true,
          doctor: { select: { fullName: true, role: true } },
          optometrist: { select: { fullName: true, role: true } },
          refraction: true,
          iopRecords: { orderBy: { measurementTime: 'desc' } },
          exam: true,
          diagnoses: true,
          prescriptions: { include: { items: true } },
          investigations: true,
          surgeries: true,
        },
      });

      if (!encounter) {
        return res.status(404).json({ error: 'Encounter not found' });
      }

      return res.json({ encounter });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 5. Save Visual Acuity & Refraction (Optometry Lane)
  static async saveRefraction(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { vaData, refractionData } = req.body;
      const recordedById = req.user!.userId;

      const refraction = await prisma.refraction.upsert({
        where: { encounterId: id },
        create: {
          encounterId: id,
          recordedById,
          vaData,
          refractionData,
        },
        update: {
          recordedById,
          vaData,
          refractionData,
        },
      });

      // Advance status from REGISTERED to OPTOMETRY_IN_PROGRESS / DOCTOR_WAITING
      await prisma.encounter.update({
        where: { id },
        data: { status: 'DOCTOR_WAITING' },
      });

      return res.json({ refraction });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 6. Save Intraocular Pressure (IOP)
  static async saveIOP(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { method, iopOD, iopOS, pachymetryOD, pachymetryOS, notes } = req.body;

      // Calculate approximate pachymetry-adjusted IOP if pachymetry provided (standard Dresden correction rule)
      // Correction approx: (545 - CCT) / 50 * 2.5 mmHg
      let correctedOD = iopOD;
      let correctedOS = iopOS;
      if (pachymetryOD) {
        const offset = ((545 - Number(pachymetryOD)) / 50) * 2.5;
        correctedOD = Number((Number(iopOD) + offset).toFixed(1));
      }
      if (pachymetryOS) {
        const offset = ((545 - Number(pachymetryOS)) / 50) * 2.5;
        correctedOS = Number((Number(iopOS) + offset).toFixed(1));
      }

      const iopRecord = await prisma.iOPRecord.create({
        data: {
          encounterId: id,
          method: method || 'GOLDMANN',
          iopOD,
          iopOS,
          pachymetryOD: pachymetryOD || null,
          pachymetryOS: pachymetryOS || null,
          correctedOD: correctedOD || null,
          correctedOS: correctedOS || null,
          notes: notes || null,
        },
      });

      return res.status(201).json({ iopRecord });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 7. Save Doctor Eye Exam (Slit-lamp, LOCS III lens grading, Gonioscopy, Fundus)
  static async saveExam(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { anteriorSegment, gonioscopy, posteriorSegment, canvasAnnotations } = req.body;
      const doctorId = req.user!.userId;

      const exam = await prisma.ophthalmicExam.upsert({
        where: { encounterId: id },
        create: {
          encounterId: id,
          doctorId,
          anteriorSegment,
          gonioscopy: gonioscopy || null,
          posteriorSegment,
          canvasAnnotations: canvasAnnotations || null,
        },
        update: {
          doctorId,
          anteriorSegment,
          gonioscopy: gonioscopy || null,
          posteriorSegment,
          canvasAnnotations: canvasAnnotations || null,
        },
      });

      await prisma.encounter.update({
        where: { id },
        data: { status: 'DOCTOR_EXAM', doctorId },
      });

      return res.json({ exam });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 8. Add Diagnoses
  static async addDiagnosis(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { icd10Code, diagnosisName, eye, isPrimary } = req.body;

      const diagnosis = await prisma.encounterDiagnosis.create({
        data: {
          encounterId: id,
          icd10Code,
          diagnosisName,
          eye,
          isPrimary: Boolean(isPrimary),
        },
      });

      return res.status(201).json({ diagnosis });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
