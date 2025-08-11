import 'dotenv/config';
import { initCouchbase } from './dbClient';
import { initMessageConsumer } from './kafkaClient';
import { processMessage } from './messageProcessor';

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

(async () => {
  await initCouchbase();
  await initMessageConsumer(processMessage);
})();

