import nodemailer from 'nodemailer';
import { config } from '../config.js';

function createTransport() {
  if (!config.smtpHost) {
    return null;
  }
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: config.smtpUser
      ? { user: config.smtpUser, pass: config.smtpPass }
      : undefined,
  });
}

export async function sendPasswordResetEmail({ to, fullName, resetUrl }) {
  const subject = 'Reset Password Akun BERNADA.ID';
  const text = [
    `Halo ${fullName},`,
    '',
    'Kami menerima permintaan untuk mereset password akun BERNADA.ID Anda.',
    `Tautan berikut berlaku ${config.resetTokenExpiryHours} jam. Klik untuk mengatur password baru:`,
    '',
    resetUrl,
    '',
    'Jika Anda tidak meminta reset password, abaikan email ini.',
    '',
    'Salam,',
    'Tim BERNADA.ID',
  ].join('\n');

  const transport = createTransport();
  if (!transport) {
    if (config.env === 'production') {
      console.warn('[mail:warn] SMTP_HOST belum dikonfigurasi — email reset password tidak akan terkirim.');
    }
    if (config.env !== 'production') {
      console.log(`[mail:dev] To: ${to} | Subject: ${subject}`);
      console.log(`[mail:dev] Reset URL: ${resetUrl}`);
    }
    return { sent: false, devLogged: true };
  }

  await transport.sendMail({
    from: config.emailFrom,
    to,
    subject,
    text,
  });
  return { sent: true };
}
