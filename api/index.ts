import express from 'express';
import cors from 'cors';
import { initCouchbase } from './dbClient.js';
import { telemetryRoutes } from './routes/telemetryRoutes.js';

const app = express();
app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Routes
app.use('/api/telemetry', telemetryRoutes);

(async () => {
  await initCouchbase();
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
})();
