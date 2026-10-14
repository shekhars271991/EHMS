import { Router } from 'express';
import { EncounterController } from '../controllers/encounter.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { logAuditEvent } from '../middleware/audit.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.get('/queue/live', EncounterController.getQueue as any);
router.post('/checkin', logAuditEvent('CHECKIN_ENCOUNTER', 'Encounter') as any, EncounterController.checkIn as any);
router.patch('/:id/status', logAuditEvent('UPDATE_STATUS', 'Encounter') as any, EncounterController.updateStatus as any);
router.patch('/:id/payment', logAuditEvent('UPDATE_PAYMENT', 'Encounter') as any, EncounterController.updatePayment as any);
router.patch('/:id/cancel', logAuditEvent('CANCEL_ENCOUNTER', 'Encounter') as any, EncounterController.cancelVisit as any);
router.get('/:id', logAuditEvent('VIEW_ENCOUNTER', 'Encounter') as any, EncounterController.getEncounterDetails as any);

// Clinical Workup & Exam
router.post('/:id/refraction', logAuditEvent('SAVE_REFRACTION', 'Refraction') as any, EncounterController.saveRefraction as any);
router.post('/:id/iop', logAuditEvent('SAVE_IOP', 'IOPRecord') as any, EncounterController.saveIOP as any);
router.post('/:id/exam', logAuditEvent('SAVE_EXAM', 'OphthalmicExam') as any, EncounterController.saveExam as any);
router.post('/:id/diagnoses', logAuditEvent('ADD_DIAGNOSIS', 'EncounterDiagnosis') as any, EncounterController.addDiagnosis as any);

export default router;
