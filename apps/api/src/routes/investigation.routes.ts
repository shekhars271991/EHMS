import { Router } from 'express';
import multer from 'multer';
import { InvestigationController } from '../controllers/investigation.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { logAuditEvent } from '../middleware/audit.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit

router.use(authenticateJWT as any);

router.post('/order', logAuditEvent('ORDER_INVESTIGATION', 'InvestigationOrder') as any, InvestigationController.createOrder as any);
router.post('/:id/upload', upload.single('scanImage'), logAuditEvent('UPLOAD_SCAN', 'InvestigationOrder') as any, InvestigationController.uploadAttachment as any);
router.get('/encounter/:encounterId', InvestigationController.listByEncounter as any);

export default router;
