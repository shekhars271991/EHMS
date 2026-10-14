import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class PrescriptionController {
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { encounterId, items, generalAdvice } = req.body;
      const doctorId = req.user!.userId;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'At least one prescription item is required' });
      }

      const prescription = await prisma.prescription.create({
        data: {
          encounterId,
          doctorId,
          generalAdvice,
          items: {
            create: items.map((item: any) => ({
              drugName: item.drugName,
              eye: item.eye, // OD, OS, OU
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              specialInstructions: item.specialInstructions || null,
            })),
          },
        },
        include: { items: true, doctor: { select: { fullName: true, licenseNumber: true } } },
      });

      return res.status(201).json({ prescription });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getByEncounter(req: AuthenticatedRequest, res: Response) {
    try {
      const { encounterId } = req.params;
      const prescriptions = await prisma.prescription.findMany({
        where: { encounterId },
        include: {
          items: true,
          doctor: { select: { fullName: true, licenseNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ prescriptions });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
