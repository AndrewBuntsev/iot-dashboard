import express from 'express';
import 'dotenv/config';
import { ServiceStatus } from './types/serviceStatus';
import { init as initKafka, publish } from './kafkaClient';
import { generateTelemetry } from './telemetryGenerator';


// Insure environment variables are set
const {
  MESSAGE_BROKER_HOST,
  MESSAGE_BROKER_TOPIC,
  DEVICE_ID,
  PORT
  } = process.env;

let telemetryInterval = parseInt(process.env.TELEMETRY_INTERVAL || '1000', 10);
let serviceStatus = process.env.SERVICE_STATUS || ServiceStatus.STARTED;
let simulationProcess: NodeJS.Timeout | null = null;
let messagesPublished = 0;
let messagesRemaining: number | null = null;
let startedAt: number | null = null;
let stoppedAt: number | null = null;

if (!MESSAGE_BROKER_HOST || !MESSAGE_BROKER_TOPIC || !DEVICE_ID) {
  throw new Error('Environment variables are not set properly');
}

const app = express();
app.use(express.json());

const startService = async () => {
  console.log(`Starting telemetry simulation with interval: ${telemetryInterval} ms`);

  serviceStatus = ServiceStatus.STARTED;
  startedAt = Date.now();
  stoppedAt = null;
  messagesPublished = 0;
  
  simulationProcess = setInterval(async () => {
    if (messagesRemaining == null || messagesRemaining > 0) {
      const payload = generateTelemetry(DEVICE_ID);
      await publish(payload);
      messagesPublished++;
      if (messagesRemaining != null) {
        messagesRemaining--;
      }
    } else {
      console.log(`Telemetry simulation completed, published ${messagesPublished} messages, stopping service`);
      stopService();
    }
  }, telemetryInterval);
};

const stopService = async () => {
  console.log('Telemetry simulation stopped');
  serviceStatus = ServiceStatus.STOPPED;
  stoppedAt = Date.now();

  if (simulationProcess) {
    clearInterval(simulationProcess);
    simulationProcess = null;
    messagesRemaining = null;
  }
};



(async () => {
  await initKafka();
  if (serviceStatus === ServiceStatus.STOPPED || telemetryInterval === 0) {
    console.log('Telemetry simulation is disabled (to enable, set SERVICE_STATUS to "started" and TELEMETRY_INTERVAL to a positive number)');
  } else {
    await startService();
  } 
})();



if (!PORT) {
  console.error('PORT environment variable is not set so the API server will not start');
} else {
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });

  // Start Service API
  app.post('/api/start', async (req, res) => {
    if (serviceStatus === ServiceStatus.STARTED || simulationProcess) {
      return res.status(400).json({ message: 'Service is already started, call /api/stop to stop it first' });
    }

    const { interval, messagesLimit } = req.query;

    // Validate and set telemetry interval
    const parsedTelemetryInterval = parseInt((interval ?? 1000) as string, 10);
    if (isNaN(parsedTelemetryInterval) || parsedTelemetryInterval <= 0) {
      return res.status(400).json({ message: 'Invalid telemetry interval' });
    }
    telemetryInterval = parsedTelemetryInterval;
    
    // Validate and set messages limit
    if (messagesLimit) {
      const parsedMessagesLimit = parseInt((messagesLimit) as string, 10);
      if (isNaN(parsedMessagesLimit) || parsedMessagesLimit < 0) {
        return res.status(400).json({ message: 'Invalid messages limit' });
      }
      messagesRemaining = parsedMessagesLimit;
    }
    
    startService();    

    res.status(202).json({ message: 'Telemetry service started' });
  });

  // Stop Service API
  app.post('/api/stop', async (req, res) => {
    console.log(`Telemetry simulation interrupted, published ${messagesPublished} messages, stopping service`);
    stopService();
    
    res.status(202).json({ message: 'Telemetry service stopped' });
  });

  // Get service stats API
  app.get('/api/stats', async (req, res) => {
    res.status(200).json({
      serviceStatus,
      messagesPublished,
      messagesRemaining,
      startedAt: startedAt ? new Date(startedAt).toISOString() : null,
      stoppedAt: stoppedAt ? new Date(stoppedAt).toISOString() : null,
      runningTimeMs: (stoppedAt ?? Date.now()) - (startedAt ?? Date.now())
    });
  });

  // Reset Stats API
  app.post('/api/reset-stats', async (req, res) => {
    if (serviceStatus === ServiceStatus.STARTED || simulationProcess) {
      return res.status(400).json({ message: 'Service is already started, call /api/stop to stop it first' });
    }

    startedAt = null;
    stoppedAt = null;
    messagesPublished = 0;
    messagesRemaining = null;

    res.status(202).json({ message: 'Telemetry service stats reset' });
  });
}
