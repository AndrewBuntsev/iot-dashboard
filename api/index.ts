import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errorHandler, createError } from './middleware/errorHandler';
import { initCouchbase } from './dbClient';
import { telemetryRoutes } from './routes/telemetryRoutes';


const {
  COUCHBASE_HOST,
  COUCHBASE_USER,
  COUCHBASE_PASSWORD,
  COUCHBASE_BUCKET,
  PORT,
  UI_HOST
} = process.env;

// Insure environment variables are set
if (!COUCHBASE_HOST || !COUCHBASE_USER || !COUCHBASE_PASSWORD || !COUCHBASE_BUCKET || !PORT) {
  throw new Error('Environment variables are not set properly');
}


const app = express();
app.use(cors({
  origin: UI_HOST || 'http://localhost:3000'
}));
app.use(express.json());

// Routes
app.use('/api/telemetry', telemetryRoutes);

// Route not found handler (should be after all routes)
app.use((req, res, next) => {
  next(createError(`${req.method} ${req.originalUrl} not found`, 404));
});

// Error handling middleware (should be last)
app.use(errorHandler);

(async () => {
  await initCouchbase();
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
})();
