import { Kafka, RecordMetadata, CompressionTypes } from 'kafkajs';
import { TelemetryData } from './types/telemetryData';

const {
  MESSAGE_BROKER_HOST,
  MESSAGE_BROKER_TOPIC,
  DEVICE_ID,
  MESSAGE_BROKER_CLIENT_ID = 'sensor-producer'
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
    console.log('Sensor producer started');
  } catch (err) {
    console.error('Error connecting producer:', err);
  }
};

// Publish telemetry data to Kafka topic
export const publish = async (payload: TelemetryData, useCompression: boolean = false) => {
  try {
    const result: RecordMetadata[] = await producer.send({
      topic: MESSAGE_BROKER_TOPIC as string,
      compression: useCompression ? CompressionTypes.GZIP : CompressionTypes.None,
      messages: [{ value: JSON.stringify(payload), key: Buffer.from(DEVICE_ID as string) }]
    });

    // // Log which partition each message was written to
    // result.forEach(r => {
    //   console.log(`Topic ${r.topicName}: Partition ${r.partition}, BaseOffset ${r.baseOffset}, #Messages ${r.logAppendTime}`);
    // });
  } catch (err) {
    console.error('Error publishing: ', err);
  }
};
