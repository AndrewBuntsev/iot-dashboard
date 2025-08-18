import { Kafka, Consumer } from 'kafkajs';
import { TelemetryData } from './types/telemetryData';
import { getConfig } from './config';

const appConfig = getConfig();

const kafka = new Kafka({
  clientId: appConfig.MESSAGE_BROKER_CLIENT_ID,
  brokers: [appConfig.MESSAGE_BROKER_HOST]
});

const admin = kafka.admin();
const consumers: Consumer[] = [];


// Initialize Kafka consumers to listen for telemetry messages
export const initMessageConsumers = async (processMessage: (payload: TelemetryData) => Promise<void>, consumersNumber: number = 1) => {
  try {
    // Populate consumers array
    for (let i = 0; i < consumersNumber; i++) {
      const consumer = kafka.consumer({ groupId: appConfig.MESSAGE_BROKER_CONSUMER_GROUP_ID });
      await consumer.connect();
      await consumer.subscribe({ topic: appConfig.MESSAGE_BROKER_TOPIC, fromBeginning: true });
    
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
      consumers.push(consumer);
    }
    console.log(`IoT Manager listening for telemetry..., number of consumers: ${consumers.length}`);
  } catch (err) {
    console.error('Error connecting consumer: ', err);
  }
};


// Disconnect message consumers
export const disconnectMessageConsumers = async () => {
  try {
    for (const consumer of consumers) {
      await consumer.disconnect();
    }
    consumers.length = 0;
  } catch (err) {
    console.error('Error disconnecting consumers: ', err);
  }
};

// Get consumer lag for a specific group and topic
export const getConsumersLag = async (groupId: string, topic: string) => {
  await admin.connect();

  // 1. Get latest offsets for topic
  const topicOffsets = await admin.fetchTopicOffsets(topic);
  
  // 2. Get committed offsets for the group
  const consumerOffsets = (await admin.fetchOffsets({ groupId, topics: [topic] }))[0].partitions;
  
  // 3. Calculate lag per partition
  const lags = topicOffsets.map(topicOffset => {
    const consumerOffset = consumerOffsets.find(consumerOffset => consumerOffset.partition === topicOffset.partition);
    const lag = Number(topicOffset.offset) - Number(consumerOffset?.offset || 0);
    return {
      partition: topicOffset.partition,
      latestOffset: topicOffset.offset,
      consumerOffset: consumerOffset?.offset || 0,
      lag: lag >= 0 ? lag : 0,
    };
  });

  await admin.disconnect();
  return lags;
};


// Reset consumer offsets for a specific group and topic
export const resetConsumerOffsets = async (groupId: string, topic: string) => {
  await admin.connect();
  await admin.resetOffsets({
    groupId,
    topic,
    earliest: true,   // jumps back to offset 0
  });
  await admin.disconnect();
};

// Get topic metadata
// metadata looks like:
// {
//   topics: [
//     {
//       name: 'telemetry',
//       partitions: [
//         { partitionId: 0, leader: 1, replicas: [1], isr: [1] },
//         { partitionId: 1, leader: 1, replicas: [1], isr: [1] }
//       ]
//     }
//   ]
// }
export const getTopicDetails = async (topic: string) => {
  await admin.connect();
  try {
    const [metadata, partitions] = await Promise.all([
      admin.fetchTopicMetadata({ topics: [topic] }),
      admin.fetchTopicOffsets(topic)
    ]);
    return { metadata, partitions };
  } catch (error) {
    if ((error as { type: string }).type === 'UNKNOWN_TOPIC_OR_PARTITION') {
      return { metadata: null, partitions: [] };
    }
    console.error('Error fetching topic details: ', error);
    throw error;
  } finally {
    await admin.disconnect();
  }
};

export const deleteAllMessages = async (topic: string) => {
  await admin.connect();

  const partitions = await admin.fetchTopicOffsets(topic);
  // const offsets = partitions.map(p => ({
  //   partition: p.partition,
  //   offset: p.high
  // }));

  await admin.deleteTopicRecords({ topic, partitions });
  console.log(`All messages deleted from ${topic}`);

  await admin.disconnect();
}
