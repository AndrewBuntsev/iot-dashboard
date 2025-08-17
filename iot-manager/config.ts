export interface AppConfig {
    COUCHBASE_HOST: string;
    COUCHBASE_USER: string;
    COUCHBASE_PASSWORD: string;
    COUCHBASE_BUCKET: string;
    MESSAGE_BROKER_HOST: string;
    MESSAGE_BROKER_TOPIC: string;
    MESSAGE_BROKER_CLIENT_ID: string;
    MESSAGE_BROKER_CONSUMER_GROUP_ID: string;
    PORT: number;
    SERVICE_STATUS: string;
}

const MANDATORY_ENV_VARS = [
    'COUCHBASE_HOST',
    'COUCHBASE_USER',
    'COUCHBASE_PASSWORD',
    'COUCHBASE_BUCKET',
    'MESSAGE_BROKER_HOST',
    'MESSAGE_BROKER_TOPIC'
];

let appConfig: AppConfig | null = null;

function initConfig(): void {
    // Validate required config
    for (const key of MANDATORY_ENV_VARS) {
        const value = process.env[key];
        if (value === undefined || value === null || value === '') {
            throw new Error(`Missing required config: ${key}`);
        }
    }

    appConfig = {
        COUCHBASE_HOST: process.env.COUCHBASE_HOST as string,
        COUCHBASE_USER: process.env.COUCHBASE_USER as string,
        COUCHBASE_PASSWORD: process.env.COUCHBASE_PASSWORD as string,
        COUCHBASE_BUCKET: process.env.COUCHBASE_BUCKET as string,
        MESSAGE_BROKER_HOST: process.env.MESSAGE_BROKER_HOST as string,
        MESSAGE_BROKER_TOPIC: process.env.MESSAGE_BROKER_TOPIC as string,
        MESSAGE_BROKER_CLIENT_ID: process.env.MESSAGE_BROKER_CLIENT_ID ?? 'iot-manager',
        MESSAGE_BROKER_CONSUMER_GROUP_ID: process.env.MESSAGE_BROKER_CONSUMER_GROUP_ID ?? 'iot-group',
        PORT: parseInt(process.env.PORT ?? '4000', 10),
        SERVICE_STATUS: process.env.SERVICE_STATUS ?? 'STARTED',
    };

    console.log('Config initialized: ', appConfig);
}

export function getConfig(): AppConfig {
  if (!appConfig) {
    initConfig();
  }

  return appConfig as AppConfig;
}