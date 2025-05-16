// Storage utility for invoice document uploads
//
// Env variables:
// STORAGE_TYPE=local|s3
// LOCAL_UPLOAD_PATH=uploads/invoices (for local)
// S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY (for S3)

import fs from 'fs/promises';
import path from 'path';

let s3: any = null;
if (process.env.STORAGE_TYPE === 's3') {
  // Lazy import AWS SDK v3 only if needed
  // @ts-ignore
  import('aws-sdk').then(AWS => {
    s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION,
    });
  });
}

export async function saveFileLocal(file: Buffer, filename: string): Promise<string> {
  const uploadDir = process.env.LOCAL_UPLOAD_PATH || 'uploads/invoices';
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, file);
  return filePath;
}

export async function saveFileS3(file: Buffer, filename: string): Promise<string> {
  if (!s3) throw new Error('S3 not initialized');
  const bucket = process.env.S3_BUCKET!;
  const params = {
    Bucket: bucket,
    Key: `invoices/${filename}`,
    Body: file,
    ContentType: 'application/octet-stream',
  };
  await s3.putObject(params).promise();
  return `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com/invoices/${filename}`;
}

export async function saveInvoiceDocument(file: Buffer, filename: string): Promise<string> {
  if (process.env.STORAGE_TYPE === 's3') {
    return saveFileS3(file, filename);
  }
  return saveFileLocal(file, filename);
} 