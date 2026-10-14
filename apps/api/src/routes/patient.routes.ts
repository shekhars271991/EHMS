import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { logAuditEvent } from '../middleware/audit.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.get('/', PatientController.list);
router.get('/:id', logAuditEvent('VIEW_PATIENT', 'Patient') as any, PatientController.getById);
router.get('/:id/profile', logAuditEvent('VIEW_PROFILE', 'PatientProfile') as any, PatientController.getProfile);
router.patch('/:id/profile', logAuditEvent('UPDATE_PROFILE', 'PatientProfile') as any, PatientController.updateProfile);
router.post('/', logAuditEvent('CREATE_PATIENT', 'Patient') as any, PatientController.create);

export default router;
