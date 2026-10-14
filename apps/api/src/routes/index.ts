import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import encounterRoutes from './encounter.routes';
import surgeryRoutes from './surgery.routes';
import prescriptionRoutes from './prescription.routes';
import investigationRoutes from './investigation.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/encounters', encounterRoutes);
apiRouter.use('/surgeries', surgeryRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/investigations', investigationRoutes);

export default apiRouter;
