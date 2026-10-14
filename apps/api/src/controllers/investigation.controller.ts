import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { createStorageService } from '../services/storage.service';

const storageService = createStorageService();

export class InvestigationController {
  // 1. Order an investigation (OCT, B-Scan, etc.)
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { encounterId, investigationType, eye, clinicalIndication } = req.body;

      const order = await prisma.investigationOrder.create({
        data: {
          encounterId,
          investigationType,
          eye,
          clinicalIndication,
          status: 'ORDERED',
        },
      });

      return res.status(201).json({ order });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. Upload scan image or DICOM report (stored locally or in GCS)
  static async uploadAttachment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const uploadResult = await storageService.uploadFile(file, 'investigations');

      const existingOrder = await prisma.investigationOrder.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        return res.status(404).json({ error: 'Investigation order not found' });
      }

      const currentAttachments = (existingOrder.attachments as any[]) || [];
      currentAttachments.push(uploadResult);

      const updated = await prisma.investigationOrder.update({
        where: { id },
        data: {
          attachments: currentAttachments,
          status: 'COMPLETED',
        },
      });

      return res.json({ order: updated, upload: uploadResult });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. List orders for an encounter
  static async listByEncounter(req: AuthenticatedRequest, res: Response) {
    try {
      const { encounterId } = req.params;
      const orders = await prisma.investigationOrder.findMany({
        where: { encounterId },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ orders });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
