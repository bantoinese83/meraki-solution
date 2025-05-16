import { NextRequest } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { invoiceDocuments } from '@/lib/db/schema';
import { saveInvoiceDocument } from '@/lib/storage';
import { randomUUID } from 'crypto';

// Use formidable for parsing multipart form-data
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  // Parse form-data
  const form = formidable({ multiples: false });
  const buffers: Buffer[] = [];
  const fields: Record<string, any> = {};
  let fileBuffer: Buffer | null = null;
  let filename = '';
  let mimetype = '';

  await new Promise<void>((resolve, reject) => {
    form.parse(req as any, (err, fieldsData, files) => {
      if (err) return reject(err);
      Object.assign(fields, fieldsData);
      const file = files.file;
      if (!file) return reject(new Error('No file uploaded'));
      const f = Array.isArray(file) ? file[0] : file;
      filename = f.originalFilename || f.newFilename || randomUUID();
      mimetype = f.mimetype || 'application/octet-stream';
      fileBuffer = fs.readFileSync(f.filepath);
      resolve();
    });
  });

  if (!fileBuffer) {
    return Response.json({ error: 'No file uploaded' }, { status: 400 });
  }
  const { invoiceId, type } = fields;
  if (!invoiceId) {
    return Response.json({ error: 'invoiceId is required' }, { status: 400 });
  }
  // Save file (local or S3)
  const url = await saveInvoiceDocument(fileBuffer, filename);
  // Insert DB record
  const [doc] = await db.insert(invoiceDocuments).values({
    invoiceId: Number(invoiceId),
    filename,
    url,
    type: type || null,
  }).returning();
  return Response.json({
    id: doc.id,
    invoiceId: doc.invoiceId,
    filename: doc.filename,
    url: doc.url,
    type: doc.type,
    uploadedAt: doc.uploadedAt,
  });
} 