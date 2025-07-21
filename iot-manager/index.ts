import 'dotenv/config';
import { TelemetryData } from './types/telemetryData';
import { initCouchbase, saveTelemetry } from './dbClient';
import { initMessageConsumer } from './kafkaClient';

// Insure environment variables are set
const {
  COUCHBASE_HOST,
  COUCHBASE_USER,
  COUCHBASE_PASSWORD,
  COUCHBASE_BUCKET,
  MESSAGE_BROKER_HOST,
  MESSAGE_BROKER_TOPIC
} = process.env;

if (!COUCHBASE_HOST || !COUCHBASE_USER || !COUCHBASE_PASSWORD || !COUCHBASE_BUCKET || !MESSAGE_BROKER_HOST || !MESSAGE_BROKER_TOPIC) {
  throw new Error('Environment variables are not set properly');
}

const processMessage = async (payload: TelemetryData) => {
  console.log('Received telemetry:', payload);
  await saveTelemetry(payload);
};

(async () => {
  await initCouchbase();
  await initMessageConsumer(processMessage);
})();

