import { Kafka } from 'kafkajs';
import { TelemetryData } from './types/telemetryData';

const {
  MESSAGE_BROKER_HOST,
  MESSAGE_BROKER_TOPIC,
  MESSAGE_BROKER_CLIENT_ID = 'iot-manager',
  MESSAGE_BROKER_CONSUMER_GROUP_ID = 'iot-group'
} = process.env;

const kafka = new Kafka({
  clientId: MESSAGE_BROKER_CLIENT_ID,
  brokers: [MESSAGE_BROKER_HOST as string]
});

const consumer = kafka.consumer({ groupId: MESSAGE_BROKER_CONSUMER_GROUP_ID });


// Initialize Kafka consumer to listen for telemetry messages
export const initMessageConsumer = async (processMessage: (payload: TelemetryData) => Promise<void>) => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: MESSAGE_BROKER_TOPIC as string, fromBeginning: true });
    console.log('IoT Manager listening for telemetry...');

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value === null) {
          console.warn('Received message with null value');
          return;
        }
        const payload = JSON.parse(message.value.toString()) as TelemetryData;
        await processMessage(payload);
      },
    });
  } catch (err) {
    console.error('Error connecting consumer: ', err);
  }
};

