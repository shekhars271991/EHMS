import { Router } from 'express';
import { SurgeryController } from '../controllers/surgery.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { logAuditEvent } from '../middleware/audit.middleware';

const router = Router();

router.use(authenticateJWT as any);

router.get('/', SurgeryController.list as any);
router.post('/booking', logAuditEvent('BOOK_SURGERY', 'SurgicalBooking') as any, SurgeryController.bookSurgery as any);
router.post('/:id/consent', logAuditEvent('SIGN_CONSENT', 'SurgicalBooking') as any, SurgeryController.signConsent as any);
router.patch('/:id/checklist', logAuditEvent('UPDATE_CHECKLIST', 'SurgicalBooking') as any, SurgeryController.updateChecklist as any);
router.put('/:id/operative-notes', logAuditEvent('SAVE_OPERATIVE_NOTES', 'SurgicalBooking') as any, SurgeryController.saveOperativeNotes as any);

export default router;
