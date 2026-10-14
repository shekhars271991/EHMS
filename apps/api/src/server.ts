import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './routes';

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static serving for local uploads (DICOM, fundus images, scans, signatures)
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(uploadDir));
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'Ophthalmology EMR API (EHMS)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API v1
app.use('/api/v1', apiRouter);

// Serve the built React app from the same Cloud Run service as the API.
const webDistDir = path.resolve(process.env.WEB_DIST_DIR || './apps/web/dist');
app.use(express.static(webDistDir, { index: false }));
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(webDistDir, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
  res.status(status).json({ error: status < 500 ? 'Invalid request' : 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`👁️ Ophthalmology EMR API Server Running`);
  console.log(`🚀 Port: http://localhost:${PORT}`);
  console.log(`📦 Health Check: http://localhost:${PORT}/health`);
  console.log(`=========================================`);
});

export default app;
