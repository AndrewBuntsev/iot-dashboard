import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { initCouchbase } from './dbClient.js';
import { telemetryRoutes } from './routes/telemetryRoutes.js';


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

(async () => {
  await initCouchbase();
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
})();
