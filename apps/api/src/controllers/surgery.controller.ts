import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class SurgeryController {
  // 1. Book / Schedule Surgery
  static async bookSurgery(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        patientId,
        encounterId,
        procedureName,
        eye,
        scheduledDate,
        theatreRoom,
        anaesthesiaType,
        biometryData,
      } = req.body;

      const surgeonId = req.user!.userId;

      const booking = await prisma.surgicalBooking.create({
        data: {
          patientId,
          encounterId,
          surgeonId,
          procedureName,
          eye,
          scheduledDate: new Date(scheduledDate),
          theatreRoom: theatreRoom || 'OT-1',
          anaesthesiaType: anaesthesiaType || 'TOPICAL',
          biometryData: biometryData || null,
          status: 'SCHEDULED',
        },
        include: {
          patient: true,
          surgeon: { select: { fullName: true } },
        },
      });

      return res.status(201).json({ booking });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. Sign Surgical Informed Consent
  static async signConsent(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { signatureDataUrl } = req.body;

      const booking = await prisma.surgicalBooking.update({
        where: { id },
        data: {
          consentSigned: true,
          consentSignatureUrl: signatureDataUrl,
          consentTimestamp: new Date(),
        },
      });

      return res.json({ booking });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. Update WHO Ophthalmic Checklist & Safety Sign-In
  static async updateChecklist(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { preOpChecklist } = req.body;

      const booking = await prisma.surgicalBooking.update({
        where: { id },
        data: { preOpChecklist },
      });

      return res.json({ booking });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 4. Record Operative Notes (Intra-op)
  static async saveOperativeNotes(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { operativeNotes, status } = req.body;

      const booking = await prisma.surgicalBooking.update({
        where: { id },
        data: {
          operativeNotes,
          status: status || 'RECOVERY',
        },
      });

      return res.json({ booking });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 5. List Scheduled Surgeries
  static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const bookings = await prisma.surgicalBooking.findMany({
        include: {
          patient: true,
          surgeon: { select: { fullName: true } },
        },
        orderBy: { scheduledDate: 'asc' },
      });

      return res.json({ bookings });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
