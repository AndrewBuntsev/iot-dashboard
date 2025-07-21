import { Kafka } from 'kafkajs';
import { TelemetryData } from './types/telemetryData';

const kafka = new Kafka({
  clientId: 'thermostat-producer',
  brokers: [process.env.MESSAGE_BROKER || 'localhost:9092']
});

const producer = kafka.producer();
const topic = 'telemetry';

// Initialize Kafka producer
export const init = async () => {
  try {
    await producer.connect();
    console.log('Thermostat producer started');
  } catch (err) {
    console.error('Error connecting producer:', err);
  }
};

// Publish telemetry data to Kafka topic
export const publish = async (payload: TelemetryData) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }]
    });

    console.log('Published: ', payload);
  } catch (err) {
    console.error('Error publishing: ', err);
  }
};
