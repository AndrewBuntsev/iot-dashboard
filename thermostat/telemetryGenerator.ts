import { TelemetryData } from './types/telemetryData';


let temp = 23.2;
let humidity = 61;
let pollution = 23;
let pressure = 760;

// Vary a value within a specified range
export const vary = (value: number, min: number, max: number): number => {
  const range = max - min;
  const variation = (Math.random() * range) / 10;
  return Math.max(min, Math.min(max, value + (Math.random() < 0.5 ? -variation : variation)));
}

// Generate telemetry data
export const generateTelemetry = (deviceId: string): TelemetryData => {
  temp = vary(temp, 18, 28);
  humidity = vary(humidity, 40, 90);
  pollution = vary(pollution, 10, 100);
  pressure = vary(pressure, 690, 810);

  const now = new Date();
  const payload = {
    device_id: deviceId,
    temperature: temp,
    humidity: humidity,
    air_pollution: pollution,
    pressure: pressure,
    timestamp_epoch: Math.floor(now.getTime() / 1000),
    timestamp_iso: now.toISOString()
  };

  return payload;
}
