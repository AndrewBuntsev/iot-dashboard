import 'dotenv/config';
import { init, publish } from './kafkaClient';
import { generateTelemetry } from './telemetryGenerator';


// Insure environment variables are set
const {
  MESSAGE_BROKER_HOST,
  MESSAGE_BROKER_TOPIC,
  DEVICE_ID
} = process.env;

if (!MESSAGE_BROKER_HOST || !MESSAGE_BROKER_TOPIC || !DEVICE_ID) {
  throw new Error('Environment variables are not set properly');
}


// Simulate telemetry data generation and publishing
const telemetrySimulator = async () => {
  setInterval(async () => {
    const payload = generateTelemetry(DEVICE_ID);
    await publish(payload);
  }, 1000);
};


(async () => {
  await init();
  await telemetrySimulator();
})();
