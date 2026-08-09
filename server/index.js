import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`BERNADA API v${config.appVersion} listening on http://localhost:${config.port} (${config.env})`);
});
