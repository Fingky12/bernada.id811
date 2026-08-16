import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './db.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`BERNADA API v${config.appVersion} listening on http://localhost:${config.port} (${config.env})`);
});

async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await pool.end();
      console.log('Database pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing DB pool', err);
      process.exit(1);
    }
  });

  // Force exit jika >10 detik
  setTimeout(() => {
    console.error('Force shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
