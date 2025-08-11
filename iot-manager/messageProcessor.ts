import { TelemetryData } from './types/telemetryData';
import { saveTelemetry } from './dbClient';


export const processMessage = async (payload: TelemetryData) => {
  //console.log('Received telemetry:', payload);
  await saveTelemetry(payload);
};

