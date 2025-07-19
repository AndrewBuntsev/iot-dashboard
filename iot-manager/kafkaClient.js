import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'iot-manager',
  brokers: [process.env.MESSAGE_BROKER || 'localhost:9092']
});

const topic = 'telemetry';
const consumer = kafka.consumer({ groupId: 'iot-group' });

// Initialize Kafka consumer to listen for telemetry messages
export const initMessageConsumer = async (processMessage) => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
    console.log('IoT Manager listening for telemetry...');

    await consumer.run({
      eachMessage: async ({ message }) => {
          const payload = JSON.parse(message.value.toString());
          await processMessage(payload);
      },
    });
  } catch (err) {
    console.error('Error connecting consumer: ', err);
  }
};

