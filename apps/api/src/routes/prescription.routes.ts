import { Router } from 'express';
import { PrescriptionController } from '../controllers/prescription.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { logAuditEvent } from '../middleware/audit.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.post('/', logAuditEvent('CREATE_PRESCRIPTION', 'Prescription') as any, PrescriptionController.create as any);
router.get('/encounter/:encounterId', PrescriptionController.getByEncounter as any);

export default router;
