import kafkajs, { Kafka, RecordMetadata, CompressionTypes } from 'kafkajs';
const { CompressionCodecs } = kafkajs;
import { TelemetryData } from './types/telemetryData';
import { KafkaJSLZ4 } from './utils/kafka';

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

CompressionCodecs[CompressionTypes.LZ4] = new KafkaJSLZ4().codec;

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
export const publish = async (payload: TelemetryData, compression: CompressionTypes = CompressionTypes.None) => {
  try {
    const result: RecordMetadata[] = await producer.send({
      topic: MESSAGE_BROKER_TOPIC as string,
      compression,
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
