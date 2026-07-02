import { PORT } from './config.js';
import { logInfo } from './logger.js';
import app from './app.js';

app.listen(PORT, () => {
  logInfo('server_started', {
    url: `http://localhost:${PORT}`,
    environment: process.env.NODE_ENV || 'development',
  });
});
