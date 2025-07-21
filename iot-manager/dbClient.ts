import couchbase, { Collection } from 'couchbase';
import { TelemetryData } from './types/telemetryData';

let telemetryCollection: Collection | null = null;

// Initialize Couchbase connection and create the telemetry collection with retry logic
export const initCouchbase = async (maxRetries = 10, retryDelay = 5000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const cluster = await couchbase.connect('couchbase://couchbase', {
        username: 'admin',
        password: 'password',
      });

      const bucket = cluster.bucket('telemetry');
      telemetryCollection = bucket.defaultCollection();
      console.log('Connected to Couchbase and initialized telemetry collection');
      return;
    } catch (err: any) {
      retries++;
      console.warn(`Couchbase connection failed (attempt ${retries}/${maxRetries}): ${err.message}`);
      if (retries >= maxRetries) {
        throw new Error('Failed to connect to Couchbase after multiple attempts');
      }
      await new Promise(res => setTimeout(res, retryDelay));
    }
  }
};

// Save telemetry data to Couchbase
export const saveTelemetry = async (payload: TelemetryData) => {
  if (!telemetryCollection) {
    throw new Error('Couchbase collection not initialized');
  }

  const key = `${payload.device_id}_${payload.timestamp_epoch}`;
  try {
    await telemetryCollection.upsert(key, payload);
  } catch (err) {
    console.error('Error saving telemetry: ', err);
  }
};
