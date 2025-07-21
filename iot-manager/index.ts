import { TelemetryData } from './types/telemetryData';
import { initCouchbase, saveTelemetry } from './dbClient';
import { initMessageConsumer } from './kafkaClient';


const processMessage = async (payload: TelemetryData) => {
  console.log('Received telemetry:', payload);
  await saveTelemetry(payload);
};

(async () => {
  await initCouchbase();
  await initMessageConsumer(processMessage);
})();

