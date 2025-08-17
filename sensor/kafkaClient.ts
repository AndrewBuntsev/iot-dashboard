import { Kafka, RecordMetadata } from 'kafkajs';
import murmur2 from "murmurhash-js";
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

const producer = kafka.producer({
  createPartitioner: () => ({ topic, partitionMetadata, message }) => {
    if (message.key?.toString() === 'Garage') return 0;
    if (message.key?.toString() === 'Living_Room') return 1;
    return 0;
  }
});


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
export const publish = async (payload: TelemetryData) => {
  try {
    const result: RecordMetadata[] = await producer.send({
      topic: MESSAGE_BROKER_TOPIC as string,
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
