import 'dotenv/config';
import { init, publish } from './kafkaClient';
import { TelemetryData } from './types/telemetryData';


// Insure environment variables are set
const {
  MESSAGE_BROKER_HOST,
  MESSAGE_BROKER_TOPIC,
  DEVICE_ID
} = process.env;

if (!MESSAGE_BROKER_HOST || !MESSAGE_BROKER_TOPIC || !DEVICE_ID) {
  throw new Error('Environment variables are not set properly');
}

let temp = 23.2;
let humidity = 61;
let pollution = 23;
let pressure = 760;

// Vary a value within a specified range
const vary = (value: number, min: number, max: number): number => {
  const range = max - min;
  const variation = (Math.random() * range) / 10;
  return Math.max(min, Math.min(max, value + (Math.random() < 0.5 ? -variation : variation)));
}

// Generate telemetry data
const generateTelemetry = (): TelemetryData => {
  temp = vary(temp, 18, 28);
  humidity = vary(humidity, 40, 90);
  pollution = vary(pollution, 10, 100);
  pressure = vary(pressure, 690, 810);

  const now = new Date();
  const payload = {
    device_id: DEVICE_ID,
    temperature: temp,
    humidity: humidity,
    air_pollution: pollution,
    pressure: pressure,
    timestamp_epoch: Math.floor(now.getTime() / 1000),
    timestamp_iso: now.toISOString()
  };

  return payload;
}

// Simulate telemetry data generation and publishing
const telemetrySimulator = async () => {
  setInterval(async () => {
    const payload = generateTelemetry();
    await publish(payload);
  }, 1000);
};


(async () => {
  await init();
  await telemetrySimulator();
})();
