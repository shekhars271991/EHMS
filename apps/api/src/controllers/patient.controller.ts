import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendInternalError } from '../utils/httpErrors';

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
      const rawSearch = (req.query.search as string) || '';
      const search = rawSearch.trim();

      let whereClause: any = undefined;

      if (search) {
        const orConditions: any[] = [
          { mrn: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { address: { contains: search, mode: 'insensitive' } },
        ];

        // Multi-word full name search (e.g. "Ramesh Kumar")
        const parts = search.split(/\s+/).filter(Boolean);
        if (parts.length > 1) {
          orConditions.push({
            AND: [
              { firstName: { contains: parts[0], mode: 'insensitive' } },
              { lastName: { contains: parts.slice(1).join(' '), mode: 'insensitive' } },
            ],
          });
        }

        // Also match digits-only phone search
        const digitsOnly = search.replace(/\D/g, '');
        if (digitsOnly.length >= 4) {
          orConditions.push({ phone: { contains: digitsOnly } });
        }

        whereClause = { OR: orConditions };
      }

      const patients = await prisma.patient.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return res.json({ patients });
    } catch (err: any) {
      return sendInternalError(res, err, 'Patient', 'Unable to process patient request');
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, mrn: true, fullName: true, role: true } },
          profile: true,
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

      if (!patient.profile) {
        const profile = await PatientController.getOrCreateProfile(id);
        return res.json({ patient: { ...patient, profile } });
      }

      return res.json({ patient });
    } catch (err: any) {
      return sendInternalError(res, err, 'Patient', 'Unable to process patient request');
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { firstName, lastName, dob, gender, phone, address, idCard, emergencyContact, allergies, systemicHistory } = req.body;

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
      const unusedHash = await bcrypt.hash(randomUUID(), 10);

      const patient = await prisma.patient.create({
        data: {
          mrn,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dob: new Date(dob),
          gender,
          phone: normalizedPhone,
          address: address ? address.trim() : null,
          idCard: idCard || null,
          emergencyContact: emergencyContact || null,
          allergies: allergies || [],
          systemicHistory: systemicHistory || {},
          user: {
            create: {
              email: `${mrn.toLowerCase()}@patients.internal`,
              passwordHash: unusedHash,
              fullName: `${firstName.trim()} ${lastName.trim()}`,
              role: 'PATIENT',
              mrn,
              phone: normalizedPhone,
              isActive: true,
            },
          },
          profile: { create: {} },
        },
        include: { user: { select: { id: true, mrn: true, role: true } }, profile: true },
      });

      return res.status(201).json({ patient });
    } catch (err: any) {
      return sendInternalError(res, err, 'Patient', 'Unable to process patient request');
    }
  }

  static async getOrCreateProfile(patientId: string) {
    const existing = await prisma.patientProfile.findUnique({ where: { patientId } });
    if (existing) return existing;
    return prisma.patientProfile.create({ data: { patientId } });
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const patient = await prisma.patient.findUnique({ where: { id } });
      if (!patient) return res.status(404).json({ error: 'Patient not found' });
      const profile = await PatientController.getOrCreateProfile(id);
      return res.json({ profile });
    } catch (err: any) {
      return sendInternalError(res, err, 'Patient', 'Unable to process patient request');
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const patient = await prisma.patient.findUnique({ where: { id } });
      if (!patient) return res.status(404).json({ error: 'Patient not found' });

      await PatientController.getOrCreateProfile(id);

      const allowed = [
        'refraction',
        'colorVision',
        'intraocularPressure',
        'slitBiomicroscopy',
        'dilatedFundus',
      ] as const;

      const data: Record<string, unknown> = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) data[key] = req.body[key];
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'No profile test fields provided' });
      }

      const profile = await prisma.patientProfile.update({
        where: { patientId: id },
        data: { ...data, updatedById: req.user!.userId },
      });

      return res.json({ profile });
    } catch (err: any) {
      return sendInternalError(res, err, 'Patient', 'Unable to process patient request');
    }
  }
}
