import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { requireAuth } from '../../server/middleware/require-auth.js';
import { HttpError } from '../../server/lib/http-error.js';

export const uploadsRouter = Router();

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// ponytail: base64-over-JSON, tanpa dependency multer. Ganti ke multipart + S3/CDN bila traffic produksi naik.
uploadsRouter.post('/', requireAuth, express.json({ limit: '10mb' }), async (req, res) => {
  const body = req.body ?? {};
  const base64 = typeof body.data === 'string' ? body.data : '';
  if (!base64) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'File kosong.');
  }

  let buffer;
  try {
    buffer = Buffer.from(base64, 'base64');
  } catch {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Data gambar tidak valid.');
  }
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Ukuran file maksimal 5 MB.');
  }

  const kind = detectImageKind(buffer);
  if (!kind) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Hanya JPEG, PNG, atau WEBP yang diizinkan.');
  }

  await mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${randomUUID()}.${kind}`;
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);

  res.status(201).json({ url: `/uploads/${filename}` });
});

function detectImageKind(buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
  ) {
    return 'png';
  }
  const ascii = buffer.subarray(0, 4).toString('latin1');
  const riff = buffer.subarray(8, 12).toString('latin1');
  if (ascii === 'RIFF' && riff === 'WEBP') return 'webp';
  return null;
}
