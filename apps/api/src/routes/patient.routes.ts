import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { logAuditEvent } from '../middleware/audit.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.get('/', PatientController.list);
router.get('/:id', logAuditEvent('VIEW_PATIENT', 'Patient') as any, PatientController.getById);
router.post('/', logAuditEvent('CREATE_PATIENT', 'Patient') as any, PatientController.create);

export default router;
