import { Kafka } from 'kafkajs';
import { TelemetryData } from './types/telemetryData';

const {
  MESSAGE_BROKER_HOST,
  MESSAGE_BROKER_TOPIC,
  MESSAGE_BROKER_CLIENT_ID = 'thermostat-producer'
} = process.env;

const kafka = new Kafka({
  clientId: MESSAGE_BROKER_CLIENT_ID,
  brokers: [MESSAGE_BROKER_HOST as string]
});

const producer = kafka.producer();

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
      topic: MESSAGE_BROKER_TOPIC as string,
      messages: [{ value: JSON.stringify(payload) }]
    });

    //console.log('Published: ', payload);
  } catch (err) {
    console.error('Error publishing: ', err);
  }
};
