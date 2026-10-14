import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { createStorageService } from '../services/storage.service';
import { sendInternalError } from '../utils/httpErrors';

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
      return sendInternalError(res, err, 'Investigation', 'Unable to process investigation request');
    }
  }

  // 2. Upload scan image or DICOM report (stored locally or in GCS)
  static async uploadAttachment(req: AuthenticatedRequest, res: Response) {
    let uploadedFileKey: string | undefined;
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const existingOrder = await prisma.investigationOrder.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        return res.status(404).json({ error: 'Investigation order not found' });
      }

      const uploadResult = await storageService.uploadFile(file, 'investigations');
      uploadedFileKey = uploadResult.fileKey;

      const currentAttachments = (existingOrder.attachments as any[]) || [];
      const attachment = {
        ...uploadResult,
        fileUrl: `/api/v1/investigations/${id}/attachments/file?key=${encodeURIComponent(uploadResult.fileKey)}`,
      };
      currentAttachments.push(attachment);

      const updated = await prisma.investigationOrder.update({
        where: { id },
        data: {
          attachments: currentAttachments,
          status: 'COMPLETED',
        },
      });

      return res.json({ order: updated, upload: attachment });
    } catch (err: any) {
      console.error('[Investigation] Attachment upload failed:', err);
      if (uploadedFileKey) {
        await storageService.deleteFile(uploadedFileKey).catch((cleanupError) => {
          console.error('[Investigation] Failed to clean up incomplete upload:', cleanupError);
        });
      }
      return res.status(500).json({ error: 'Unable to save attachment' });
    }
  }

  static async downloadAttachment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const key = typeof req.query.key === 'string' ? req.query.key : '';
      const order = await prisma.investigationOrder.findUnique({ where: { id } });
      if (!order || !key) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      const attachments = (order.attachments as any[]) || [];
      const attachment = attachments.find((item) => item.fileKey === key);
      if (!attachment) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      const stream = await storageService.downloadFile(key);
      res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${String(attachment.filename || 'attachment').replace(/[^\w.-]/g, '_')}"`);
      res.setHeader('Cache-Control', 'private, no-store');
      stream.on('error', (error) => {
        console.error('[Investigation] Attachment download failed:', error);
        if (res.headersSent) res.destroy(error as Error);
        else res.status(404).json({ error: 'Attachment not found' });
      });
      stream.pipe(res);
    } catch (err: any) {
      console.error('[Investigation] Attachment download failed:', err);
      return res.status(500).json({ error: 'Unable to retrieve attachment' });
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
      return sendInternalError(res, err, 'Investigation', 'Unable to process investigation request');
    }
  }
}
