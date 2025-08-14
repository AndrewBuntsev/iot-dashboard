import 'dotenv/config';
import { init as initKafka, publish } from './kafkaClient';
import { generateTelemetry } from './telemetryGenerator';


// Insure environment variables are set
const {
  MESSAGE_BROKER_HOST,
  MESSAGE_BROKER_TOPIC,
  DEVICE_ID,
  } = process.env;

const TELEMETRY_INTERVAL = parseInt(process.env.TELEMETRY_INTERVAL || '1000', 10);

if (!MESSAGE_BROKER_HOST || !MESSAGE_BROKER_TOPIC || !DEVICE_ID) {
  throw new Error('Environment variables are not set properly');
}


// Simulate telemetry data generation and publishing
const telemetrySimulator = async () => {
  setInterval(async () => {
    const payload = generateTelemetry(DEVICE_ID);
    await publish(payload);
  }, TELEMETRY_INTERVAL);
};


(async () => {
  await initKafka();
  if (TELEMETRY_INTERVAL === 0) {
    console.log('Telemetry simulation is disabled (to enable, set TELEMETRY_INTERVAL environment variable to a positive value in milliseconds)');
  } else {
    console.log(`Starting telemetry simulation with interval: ${TELEMETRY_INTERVAL} ms`);
    await telemetrySimulator();
  } 
})();
