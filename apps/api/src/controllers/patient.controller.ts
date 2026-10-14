import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class PatientController {
  // Generate unique Medical Record Number (MRN) format: EYE-YYYY-XXXXXX
  private static async generateMRN(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.patient.count();
    const seq = String(count + 1).padStart(6, '0');
    return `EYE-${year}-${seq}`;
  }

  static async list(req: Request, res: Response) {
    try {
      const search = (req.query.search as string) || '';
      const patients = await prisma.patient.findMany({
        where: search
          ? {
              OR: [
                { mrn: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
              ],
            }
          : undefined,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return res.json({ patients });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
          encounters: {
            orderBy: { visitDate: 'desc' },
            include: {
              doctor: { select: { fullName: true } },
              optometrist: { select: { fullName: true } },
              diagnoses: true,
              prescriptions: { include: { items: true } },
            },
          },
          surgeries: {
            orderBy: { scheduledDate: 'desc' },
            include: { surgeon: { select: { fullName: true } } },
          },
        },
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      return res.json({ patient });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { firstName, lastName, dob, gender, phone, idCard, emergencyContact, allergies, systemicHistory } = req.body;

      if (!firstName || !lastName || !dob || !gender || !phone) {
        return res.status(400).json({ error: 'First name, last name, DOB, gender, and phone are required.' });
      }

      const normalizedPhone = phone.trim();

      // Enforce: two patients with same phone number will not be allowed
      const existingPatient = await prisma.patient.findFirst({
        where: { phone: normalizedPhone },
      });

      if (existingPatient) {
        return res.status(409).json({
          error: `A patient with phone number ${normalizedPhone} is already registered (${existingPatient.mrn} - ${existingPatient.firstName} ${existingPatient.lastName}). Duplicate phone numbers are not allowed.`,
        });
      }

      const mrn = await PatientController.generateMRN();

      const patient = await prisma.patient.create({
        data: {
          mrn,
          firstName,
          lastName,
          dob: new Date(dob),
          gender,
          phone,
          idCard: idCard || null,
          emergencyContact: emergencyContact || null,
          allergies: allergies || [],
          systemicHistory: systemicHistory || {},
        },
      });

      return res.status(201).json({ patient });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
