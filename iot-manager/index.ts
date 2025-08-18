import express from 'express';
import 'dotenv/config';
import { ServiceStatus } from './types/serviceStatus';
import { getConfig } from './config';
import { initCouchbase } from './dbClient';
import { deleteAllMessages, disconnectMessageConsumers, getConsumersLag, getTopicDetails, initMessageConsumers, resetConsumerOffsets } from './kafkaClient';
import { getMessagesConsumed, processMessage, setMessagesConsumed } from './messageProcessor';


const appConfig = getConfig();

let serviceStatus = appConfig.SERVICE_STATUS || ServiceStatus.STARTED;
let startedAt: number | null = null;
let stoppedAt: number | null = null;

const app = express();
app.use(express.json());

(async () => {
  await initCouchbase();
  if (serviceStatus === ServiceStatus.STARTED) {
    await initMessageConsumers(processMessage, 1);
  }
})();

if (!appConfig.PORT) {
  console.error('PORT environment variable is not set so the API server will not start');
} else {
  app.listen(appConfig.PORT, () => {
    console.log(`API server listening on port ${appConfig.PORT}`);
  });

  // Start Service API
  app.post('/api/start', async (req, res) => {
    if (serviceStatus === ServiceStatus.STARTED) {
      return res.status(400).json({ message: 'Service is already started, call /api/stop to stop it first' });
    }

    // Validate consumersNumber
    const parsedConsumersNumber = parseInt((req.query.consumersNumber ?? 1) as string, 10);
    if (isNaN(parsedConsumersNumber) || parsedConsumersNumber <= 0) {
      return res.status(400).json({ message: 'Invalid consumers number' });
    }

    await initMessageConsumers(processMessage, parsedConsumersNumber);
    serviceStatus = ServiceStatus.STARTED;
    startedAt = Date.now();
    stoppedAt = null;
    setMessagesConsumed(0);

    res.status(202).json({ message: 'Consuming service started' });
  });

  // Stop Service API
  app.post('/api/stop', async (req, res) => {
    console.log('Stopping consuming service...');
    console.log(`Consuming service interrupted, stopping service`);
    await disconnectMessageConsumers();
    serviceStatus = ServiceStatus.STOPPED;
    stoppedAt = Date.now();

    res.status(202).json({ message: 'Consuming service stopped' });
  });

  // Reset Consumer Offsets API
  app.post('/api/reset-offsets', async (req, res) => {
    await resetConsumerOffsets(appConfig.MESSAGE_BROKER_CONSUMER_GROUP_ID, appConfig.MESSAGE_BROKER_TOPIC);
    res.status(202).json({ message: 'Consumer offsets reset' });
  });

  // Delete all messages
  app.post('/api/delete-messages', async (req, res) => {
    await deleteAllMessages(appConfig.MESSAGE_BROKER_TOPIC);
    res.status(202).json({ message: 'All messages deleted' });
  });

  // Get Topic Details API
  app.get('/api/topic/:topic', async (req, res) => {
    const { topic } = req.params;
    const details = await getTopicDetails(topic);
    res.status(200).json(details);
  });

  // Get service stats API
  app.get('/api/stats', async (req, res) => {
    const consumerPartitionsLag = await getConsumersLag(appConfig.MESSAGE_BROKER_CONSUMER_GROUP_ID, appConfig.MESSAGE_BROKER_TOPIC);
    res.status(200).json({
      serviceStatus,
      messagesConsumed: getMessagesConsumed(),
      startedAt: startedAt ? new Date(startedAt).toISOString() : null,
      stoppedAt: stoppedAt ? new Date(stoppedAt).toISOString() : null,
      runningTimeMs: (stoppedAt ?? Date.now()) - (startedAt ?? Date.now()),
      totalLag: consumerPartitionsLag.reduce((acc, partition) => acc + partition.lag, 0),
      consumerPartitionsLag
    });
  });
}