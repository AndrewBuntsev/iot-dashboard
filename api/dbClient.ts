import couchbase, { Cluster, Collection } from 'couchbase';

let cluster: Cluster | null = null;
let telemetryCollection: Collection | null = null;

// Initialize Couchbase connection and create the telemetry collection with retry logic
export const initCouchbase = async (maxRetries = 10, retryDelay = 5000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      cluster = await couchbase.connect('couchbase://couchbase', {
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

// Execute a query
export const execQuery = async (query: string) => {
  if (!cluster) {
    throw new Error('Couchbase cluster is not initialized. Call initCouchbase() first.');
  }
  try {
    const result = await cluster.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error executing query: ', err);
  }
};
