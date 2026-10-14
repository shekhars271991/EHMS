import fs from 'fs';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

export interface UploadedFileResult {
  filename: string;
  mimeType: string;
  size: number;
  fileKey: string;
}

export interface IStorageService {
  uploadFile(file: Express.Multer.File, subfolder: string): Promise<UploadedFileResult>;
  downloadFile(fileKey: string): Promise<Readable>;
  deleteFile(fileKey: string): Promise<void>;
}

// 1. Local Storage Implementation (default for development/offline)
export class LocalStorageService implements IStorageService {
  private baseDir: string;

  constructor(baseDir: string = './uploads') {
    this.baseDir = path.resolve(baseDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, subfolder: string): Promise<UploadedFileResult> {
    const targetFolder = path.join(this.baseDir, subfolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${randomUUID()}-${path.basename(file.originalname).replace(/[^\w.-]/g, '_')}`;
    const destinationPath = path.join(targetFolder, uniqueName);

    fs.writeFileSync(destinationPath, file.buffer);

    return {
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fileKey: `${subfolder}/${uniqueName}`,
    };
  }

  async downloadFile(fileKey: string): Promise<Readable> {
    const fullPath = this.resolveFileKey(fileKey);
    await fs.promises.access(fullPath, fs.constants.R_OK);
    return fs.createReadStream(fullPath);
  }

  async deleteFile(fileKey: string): Promise<void> {
    const fullPath = this.resolveFileKey(fileKey);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  private resolveFileKey(fileKey: string): string {
    if (!fileKey || path.posix.isAbsolute(fileKey) || fileKey.split(/[\\/]/).some((part) => part === '..')) {
      throw new Error('Invalid attachment key');
    }
    const fullPath = path.resolve(this.baseDir, fileKey);
    if (!fullPath.startsWith(`${this.baseDir}${path.sep}`)) {
      throw new Error('Invalid attachment key');
    }
    return fullPath;
  }
}

// 2. Google Cloud Storage (GCS) Pluggable Adapter
export class GCSStorageService implements IStorageService {
  private bucketName: string;
  private storage: Storage;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
    this.storage = new Storage();
  }

  async uploadFile(file: Express.Multer.File, subfolder: string): Promise<UploadedFileResult> {
    const safeFilename = path.basename(file.originalname).replace(/[^\w.-]/g, '_');
    const objectKey = `${subfolder}/${Date.now()}-${randomUUID()}-${safeFilename}`;
    await this.storage.bucket(this.bucketName).file(objectKey).save(file.buffer, {
      resumable: false,
      metadata: { contentType: file.mimetype },
    });

    return {
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fileKey: objectKey,
    };
  }

  async downloadFile(fileKey: string): Promise<Readable> {
    this.validateFileKey(fileKey);
    return this.storage.bucket(this.bucketName).file(fileKey).createReadStream();
  }

  async deleteFile(fileKey: string): Promise<void> {
    this.validateFileKey(fileKey);
    await this.storage.bucket(this.bucketName).file(fileKey).delete({ ignoreNotFound: true });
  }

  private validateFileKey(fileKey: string) {
    if (!fileKey || path.posix.isAbsolute(fileKey) || fileKey.split('/').some((part) => !part || part === '..')) {
      throw new Error('Invalid attachment key');
    }
  }
}

// Factory: switches between Local and GCS based on STORAGE_PROVIDER
export function createStorageService(): IStorageService {
  const provider = process.env.STORAGE_PROVIDER || 'LOCAL';
  if (provider === 'GCS' && process.env.GCS_BUCKET_NAME) {
    return new GCSStorageService(process.env.GCS_BUCKET_NAME);
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('GCS storage must be configured in production.');
  }
  return new LocalStorageService(process.env.UPLOAD_DIR || './uploads');
}
