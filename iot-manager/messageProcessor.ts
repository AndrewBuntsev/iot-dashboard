import { TelemetryData } from './types/telemetryData';
import { saveTelemetry } from './dbClient';

let messagesConsumed = 0;
export const getMessagesConsumed = () => messagesConsumed;
export const setMessagesConsumed = (count: number) => {
  messagesConsumed = count;
};

export const processMessage = async (payload: TelemetryData) => {
  //console.log('Received telemetry:', payload);
  await saveTelemetry(payload);
  messagesConsumed++;
};

