import { initCouchbase, saveTelemetry } from './dbClient.js';
import { initMessageConsumer } from './kafkaClient.js';


const processMessage = async (payload) => {
  console.log('Received telemetry:', payload);
  await saveTelemetry(payload);
};

(async () => {
  await initCouchbase();
  await initMessageConsumer(processMessage);
})();

