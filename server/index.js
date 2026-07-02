import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {
  PORT,
  RATE_LIMIT,
  HELMET_CONFIG,
  CORS_OPTIONS,
} from './config.js';
import {
  logInfo,
  requestIdMiddleware,
  requestLoggingMiddleware,
} from './logger.js';

import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import inventoryRoutes from './routes/inventory.js';
import requestsRoutes from './routes/requests.js';
import custodyRoutes from './routes/custody.js';
import movementsRoutes from './routes/movements.js';

const app = express();

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.api.windowMs,
  max: RATE_LIMIT.api.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: RATE_LIMIT.api.message },
});

app.use(requestIdMiddleware);
app.use(helmet(HELMET_CONFIG));
app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use(express.static('public', { index: 'index.html' }));
app.use('/api', requestLoggingMiddleware);
app.use('/api', apiLimiter);

app.use(healthRoutes);
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(inventoryRoutes);
app.use(requestsRoutes);
app.use(custodyRoutes);
app.use(movementsRoutes);

app.listen(PORT, () => {
  logInfo('server_started', {
    url: `http://localhost:${PORT}`,
    environment: process.env.NODE_ENV || 'development',
  });
});
