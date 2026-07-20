import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RATE_LIMIT,
  HELMET_CONFIG,
  STATIC_MAX_AGE_MS,
  NODE_ENV,
} from './config.js';
import {
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
import reportsRoutes from './routes/reports.js';
import eventsRoutes from './routes/events.js';
import acceptanceRoutes from './routes/acceptance.js';

const noop = (req, res, next) => next();

const apiLimiter = NODE_ENV === 'test'
  ? noop
  : rateLimit({
    windowMs: RATE_LIMIT.api.windowMs,
    max: RATE_LIMIT.api.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: RATE_LIMIT.api.message },
  });

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const app = express();
app.set('trust proxy', 1);
app.use(requestIdMiddleware);
app.use(helmet(HELMET_CONFIG));
// SSE precisa de flush imediato — não pode passar pelo buffer do gzip.
app.use(compression({ filter: (req, res) => req.path !== '/api/events' && compression.filter(req, res) }));
app.use(express.json());
app.use(express.static(publicDir, { index: 'index.html', maxAge: STATIC_MAX_AGE_MS }));
app.use('/api', requestLoggingMiddleware);
app.use('/api', apiLimiter);

app.use(healthRoutes);
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(inventoryRoutes);
app.use(requestsRoutes);
app.use(custodyRoutes);
app.use(movementsRoutes);
app.use(reportsRoutes);
app.use(eventsRoutes);
app.use(acceptanceRoutes);

export default app;
