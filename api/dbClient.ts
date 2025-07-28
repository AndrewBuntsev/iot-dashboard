import couchbase, { Cluster, Collection } from 'couchbase';
import { QueryParam } from './types/queryParam';

let cluster: Cluster | null = null;
let telemetryCollection: Collection | null = null;

const {
  COUCHBASE_HOST,
  COUCHBASE_USER,
  COUCHBASE_PASSWORD,
  COUCHBASE_BUCKET,
} = process.env;

// Initialize Couchbase connection and create the telemetry collection with retry logic
export const initCouchbase = async (maxRetries = 10, retryDelay = 5000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      cluster = await couchbase.connect(`couchbase://${COUCHBASE_HOST}`, {
        username: COUCHBASE_USER,
        password: COUCHBASE_PASSWORD,
      });

      const bucket = cluster.bucket(COUCHBASE_BUCKET as string);
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

// Execute a query
export const execQuery = async (query: string, params: QueryParam) => {
  if (!cluster) {
    throw new Error('Couchbase cluster is not initialized. Call initCouchbase() first.');
  }
  try {
    const result = await cluster.query(query, { parameters: params, adhoc: false });
    return result.rows;
  } catch (err) {
    console.error('Error executing query: ', err);
  }
};
