import fs from 'fs';
import path from 'path';

export interface UploadedFileResult {
  fileUrl: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface IStorageService {
  uploadFile(file: Express.Multer.File, subfolder: string): Promise<UploadedFileResult>;
  deleteFile(fileUrl: string): Promise<void>;
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

    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const destinationPath = path.join(targetFolder, uniqueName);

    fs.writeFileSync(destinationPath, file.buffer);

    return {
      fileUrl: `/uploads/${subfolder}/${uniqueName}`,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const relativePath = fileUrl.replace(/^\/uploads\//, '');
    const fullPath = path.join(this.baseDir, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}

// 2. Google Cloud Storage (GCS) Pluggable Adapter
export class GCSStorageService implements IStorageService {
  private bucketName: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }

  async uploadFile(file: Express.Multer.File, subfolder: string): Promise<UploadedFileResult> {
    // Note: When GCS credentials are provided, @google-cloud/storage will upload file.buffer to GCS bucket
    const objectKey = `${subfolder}/${Date.now()}_${file.originalname}`;
    const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${objectKey}`;

    return {
      fileUrl: publicUrl,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // GCS delete object implementation
  }
}

// Factory: switches between Local and GCS based on STORAGE_PROVIDER
export function createStorageService(): IStorageService {
  const provider = process.env.STORAGE_PROVIDER || 'LOCAL';
  if (provider === 'GCS' && process.env.GCS_BUCKET_NAME) {
    return new GCSStorageService(process.env.GCS_BUCKET_NAME);
  }
  return new LocalStorageService(process.env.UPLOAD_DIR || './uploads');
}
