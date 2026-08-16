import { HttpError } from "../lib/http-error.js";

export function notFoundHandler(req, res, next) {
  next(new HttpError(404, 'NOT_FOUND', 'Resource tidak ditemukan.'));
}

export function errorHandler(err, req, res, next) {
  //jika error bukan HttError, jadikan 500
  if (!(err instanceof HttpError)) {
    console.error('Unhandled error:', err);
    err = new HttpError(500, 'INTERNAL_ERROR', 'Terjadi kesalahan pada server.'); 
  }
  //Log error server
  if (err.status >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${err.message}
    `);
  } 

  res.status(err.status).json({
    error: {
      code: err.code,
      message: err.message,
    },
  });
}

