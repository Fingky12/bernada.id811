import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { apiRouter } from '../api/index.js';
import { notFoundHandler, errorHandler } from './middleware/error-handler.js';
import * as invitationService from './services/invitation-service.js';

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../', import.meta.url)));

function escapeHtmlMeta(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDateShort(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

async function renderInvitationPage(req) {
  let html = readFileSync(path.join(ROOT_DIR, 'pages', 'invitation.html'), 'utf8');
  let invitation = null;
  try {
    invitation = (
      await invitationService.getPublishedInvitationBySlug(String(req.params.slug || ''))
    ).invitation;
  } catch {
    /* tidak ditemukan / belum terbit — pakai meta generik */
  }

  const origin = `${req.protocol}://${req.get('host')}`;
  const couple = invitation?.couple || invitation?.title || '';
  const dateText = formatDateShort(invitation?.eventDate);

  const title = couple
    ? `${couple} — Undangan Pernikahan Digital`
    : 'Undangan Digital — BERNADA.ID';
  const description = couple
    ? `${dateText ? `${dateText}. ` : ''}${invitation?.venue ? `${invitation.venue}. ` : ''}Anda diundang — buka undangan digital ini untuk detail acara & konfirmasi kehadiran.`
    : 'Undangan digital pribadi — lihat detail acara, hitung mundur, dan informasi lokasi.';
  const gallery = Array.isArray(invitation?.gallery) ? invitation.gallery.filter(Boolean) : [];
  const firstPhoto = gallery[0];
  const image = firstPhoto
    ? (firstPhoto.startsWith('http://') || firstPhoto.startsWith('https://')
        ? firstPhoto
        : `${origin}${firstPhoto.startsWith('/') ? '' : '/'}${firstPhoto}`)
    : '';

  return html
    .replaceAll('__META_TITLE__', escapeHtmlMeta(title))
    .replaceAll('__META_DESCRIPTION__', escapeHtmlMeta(description))
    .replaceAll('__META_URL__', escapeHtmlMeta(`${origin}/u/${encodeURIComponent(req.params.slug || '')}`))
    .replaceAll('__META_IMAGE__', escapeHtmlMeta(image));
}

function resolveCorsOrigins(raw) {
  if (raw === '' || raw === '*') {
    return raw === '' ? false : '*';
  }
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (config.env === 'production') {
    app.set('trust proxy', 1);
  }
  app.use(helmet());
  app.use(cors({ origin: resolveCorsOrigins(config.corsOrigin) }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiRouter);

  app.use('/assets', express.static(path.join(ROOT_DIR, 'assets')));
  app.use('/uploads', express.static(path.join(ROOT_DIR, 'uploads')));
  app.use('/pages', express.static(path.join(ROOT_DIR, 'pages')));

  const page = (file) => (req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'pages', file));
  };

  app.get('/', (req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'index.html'));
  });
  app.get('/login', page('login.html'));
  app.get('/builder', page('builder.html'));
  app.get('/admin', page('admin.html'));
  app.get('/checkout', page('checkout.html'));
  app.get('/u/:slug', async (req, res, next) => {
    try {
      res.send(await renderInvitationPage(req));
    } catch (error) {
      next(error);
    }
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

