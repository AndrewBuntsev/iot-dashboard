/**
 * Kafka integration test suite:
 *
 * Validates the full flow between producers (sensors) and consumers (IoT Manager).
 *
 * Steps:
 * - Init: verify sensors & IoT Manager start in "stopped" state.
 * - Producers: start sensors, publish 100k msgs each, then auto-stop.
 * - Topic: fetch telemetry metadata (2 partitions) via KafkaJS admin API.
 * - Consumer (1 instance): start via REST, consume until lag=0, stop, record time.
 * - Reset: rewind offsets to beginning, confirm lag≈200k.
 * - Consumers (2 instances): start via REST, consume until lag=0, stop, record time.
 * - Compare: assert 2 consumers process faster than 1.
 *
 * REST API:
 * - publisher: /api/start, api/stop, /api/stats
 * - consumer: /api/start, /api/stop, /api/stats, /api/reset-offsets, /api/topic/:topic
 *
 * Goals:
 * - Ensure end-to-end Kafka pipeline works across containers.
 * - Validate partitioning, offsets, offset resets and lag tracking.
 * - Measure scaling effect (1 vs 2 consumers).
 * - Provide control & observability via REST.
 */




import { test, expect, request, APIRequestContext } from '@playwright/test';

const SENSOR_1_BASE_URL = 'http://localhost:5001';
const SENSOR_2_BASE_URL = 'http://localhost:5002';
const IOT_MANAGER_BASE_URL = 'http://localhost:6000';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getServiceStat = async (context: APIRequestContext) => {
  const response = await context.get('/api/stats');
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  return response.json();
};


test.describe('Test Kafka producers and consumers', () => {
  let sensor1Context: APIRequestContext;
  let sensor2Context: APIRequestContext;
  let iotManagerContext: APIRequestContext;
  let consumingTimeWithOneConsumer: number;
  let consumingTimeWithTwoConsumers: number;

  // Called after each test
  test.afterEach(async () => {
    console.log('-------------------------------------------------------')
    await delay(2000);
  });


  test('Initialize sensors and check their default status', async ({ playwright }) => {
    // Initialize contexts for each sensor
    sensor1Context = await request.newContext({
      baseURL: SENSOR_1_BASE_URL,
    });
    sensor2Context = await request.newContext({
      baseURL: SENSOR_2_BASE_URL,
    });
    
    // Ensure both sensors are stopped and no messages published
    const sensor1Stat = await getServiceStat(sensor1Context);
    const sensor2Stat = await getServiceStat(sensor2Context);
    expect(sensor1Stat).toHaveProperty('serviceStatus', 'stopped');
    expect(sensor1Stat).toHaveProperty('messagesPublished', 0);
    expect(sensor2Stat).toHaveProperty('serviceStatus', 'stopped');
    expect(sensor2Stat).toHaveProperty('messagesPublished', 0);
  });


  test('Start message publishing and check sensors status', async ({ playwright }) => {
    // Start both sensors
    console.log('Starting both sensors');
    await Promise.all([
      sensor1Context.post('/api/start?interval=1&messagesLimit=100000'),
      sensor2Context.post('/api/start?interval=1&messagesLimit=100000'),
    ]);

    // Ensure both sensors are started
    let sensor1Stat = await getServiceStat(sensor1Context);
    let sensor2Stat = await getServiceStat(sensor2Context);
    expect(sensor1Stat).toHaveProperty('serviceStatus', 'started');
    expect(sensor2Stat).toHaveProperty('serviceStatus', 'started');
    console.log('Both sensors started successfully');
  });


  test('Produce telemetry data and ensure messages are published and sensors are stopped after that', async ({ playwright }) => {
    // Set timeout to 3 minutes
    test.setTimeout(60000 * 3);

    // Check stat every 5 seconds until it is stopped again
    let sensorsRunning = true;
    while (sensorsRunning) {
      await delay(5000);
      const sensor1Stat = await getServiceStat(sensor1Context);
      console.log('Sensor 1 Stat: ', sensor1Stat);
      const sensor2Stat = await getServiceStat(sensor2Context);
      console.log('Sensor 2 Stat: ', sensor2Stat);
      sensorsRunning = sensor1Stat.serviceStatus === 'started' || sensor2Stat.serviceStatus === 'started';
    }

    console.log('Both sensors stopped successfully');
    const sensor1Stat = await getServiceStat(sensor1Context);
    const sensor2Stat = await getServiceStat(sensor2Context);
    expect(sensor1Stat).toHaveProperty('serviceStatus', 'stopped');
    expect(sensor1Stat).toHaveProperty('messagesPublished', 100000);
    expect(sensor1Stat).toHaveProperty('stoppedAt');
    expect(sensor2Stat).toHaveProperty('serviceStatus', 'stopped');
    expect(sensor2Stat).toHaveProperty('messagesPublished', 100000);
    expect(sensor2Stat).toHaveProperty('stoppedAt');
  });


  test('Initialize context for iot-manager and check its status', async ({ playwright }) => {
    // Initialize context for iot-manager
    iotManagerContext = await request.newContext({
      baseURL: IOT_MANAGER_BASE_URL,
    });

    // Ensure iot-manager is stopped
    let iotManagerStat = await getServiceStat(iotManagerContext);
    expect(iotManagerStat).toHaveProperty('serviceStatus', 'stopped');
  });


  test('Check there are 2 topic partitions', async ({ playwright }) => {
    // Get topic metadata
    const topicMetadataResponse = await iotManagerContext.get('/api/topic/telemetry');
    expect(topicMetadataResponse.ok()).toBeTruthy();
    expect(topicMetadataResponse.status()).toBe(200);
    const topicMetadata = await topicMetadataResponse.json();

    // Topic metadata must have the following structure:
    // {
    //     "topics": [
    //         {
    //             "name": "telemetry",
    //             "partitions": [
    //                 {
    //                     "partitionErrorCode": 0,
    //                     "partitionId": 0,
    //                     "leader": 1,
    //                     "replicas": [
    //                         1
    //                     ],
    //                     "isr": [
    //                         1
    //                     ],
    //                     "offlineReplicas": []
    //                 },
    //                 {
    //                     "partitionErrorCode": 0,
    //                     "partitionId": 1,
    //                     "leader": 1,
    //                     "replicas": [
    //                         1
    //                     ],
    //                     "isr": [
    //                         1
    //                     ],
    //                     "offlineReplicas": []
    //                 }
    //             ]
    //         }
    //     ]
    // }
    expect(topicMetadata).toHaveProperty('topics');
    expect(topicMetadata.topics).toHaveLength(1);
    expect(topicMetadata.topics[0]).toHaveProperty('name', 'telemetry');
    expect(topicMetadata.topics[0]).toHaveProperty('partitions');
    expect(topicMetadata.topics[0].partitions).toHaveLength(2);
    expect(topicMetadata.topics[0].partitions[0]).toHaveProperty('partitionId', 0);
    expect(topicMetadata.topics[0].partitions[1]).toHaveProperty('partitionId', 1);
    console.log('Topic metadata is valid, 2 partitions found');    
  });


  test('Starting iot-manager (kafka-consumer) and checking its status', async ({ playwright }) => {
    // Starting iot-manager (kafka-consumer), creating a new consumer group with 1 consumer
    console.log('Starting iot-manager (kafka-consumer)...');
    await iotManagerContext.post('/api/start');
    const iotManagerStat = await getServiceStat(iotManagerContext);
    expect(iotManagerStat).toHaveProperty('serviceStatus', 'started');
    console.log('iot-manager started successfully');
  });


  test('Consuming all the messages and stopping iot-manager (kafka-consumer) after consumption', async ({ playwright }) => {
    test.setTimeout(60000 * 3);
    let iotManagerStat = await getServiceStat(iotManagerContext);
    // Check iot-manager (kafka-consumer) stats every second until lag reaches 0
    let totalLag = iotManagerStat.totalLag || 0;
    while (totalLag > 1) {
      await delay(1000);
      iotManagerStat = await getServiceStat(iotManagerContext);
      console.log('iot-manager Stat: ', iotManagerStat);
      totalLag = iotManagerStat.totalLag || 0;
    }

    // Stop iot-manager (kafka-consumer)
    console.log('Stopping iot-manager (kafka-consumer)...');
    await iotManagerContext.post('/api/stop');
    iotManagerStat = await getServiceStat(iotManagerContext);
    expect(iotManagerStat).toHaveProperty('serviceStatus', 'stopped');
    iotManagerStat = await getServiceStat(iotManagerContext);
    expect(iotManagerStat).toHaveProperty('totalLag', 0);
    consumingTimeWithOneConsumer = iotManagerStat.runningTimeMs;
    console.log(`iot-manager finished consuming messages, consumed messages: ${iotManagerStat.messagesConsumed}, total time: ${iotManagerStat.runningTimeMs} ms, current lag: ${iotManagerStat.totalLag}`);
  });


  test('Reset consumer group offsets', async ({ playwright }) => {
    await iotManagerContext.post('/api/reset-offsets');
    const iotManagerStat = await getServiceStat(iotManagerContext);
    expect(iotManagerStat.totalLag).toBeGreaterThanOrEqual(200000);
  });


  test('Restart consumer group with 2 consumers', async ({ playwright }) => {
    // Restart consumer group with 2 consumers
    console.log('Restarting iot-manager (kafka-consumer) with 2 consumers...');
    await iotManagerContext.post('/api/start?consumersNumber=2');
    const iotManagerStat = await getServiceStat(iotManagerContext);
    expect(iotManagerStat).toHaveProperty('serviceStatus', 'started');
    console.log('iot-manager started successfully');
    console.log('iot-manager Stat: ', iotManagerStat);
  });


  test('Check IoT Manager service status and consumer offsets', async ({ playwright }) => {
    test.setTimeout(60000 * 3);
    let iotManagerStat = await getServiceStat(iotManagerContext);
    // Check iot-manager (kafka-consumer) stats every second until lag reaches 0
    let totalLag = iotManagerStat.totalLag || 0;
    while (totalLag > 1) {
      await delay(1000);
      iotManagerStat = await getServiceStat(iotManagerContext);
      console.log('iot-manager Stat: ', iotManagerStat);
      totalLag = iotManagerStat.totalLag || 0;
    }

    // Stop iot-manager (kafka-consumer)
    console.log('Stopping iot-manager (kafka-consumer)...');
    await iotManagerContext.post('/api/stop');
    iotManagerStat = await getServiceStat(iotManagerContext);
    expect(iotManagerStat).toHaveProperty('serviceStatus', 'stopped');
    iotManagerStat = await getServiceStat(iotManagerContext);
    consumingTimeWithTwoConsumers = iotManagerStat.runningTimeMs;
    console.log(`iot-manager finished consuming messages, consumed messages: ${iotManagerStat.messagesConsumed}, total time: ${iotManagerStat.runningTimeMs} ms, current lag: ${iotManagerStat.totalLag}`);
  });


  test('Comparing performance between 1 and 2 consumers', async ({ playwright }) => {
    console.log(`Consuming time with 1 consumer: ${consumingTimeWithOneConsumer} ms`);
    console.log(`Consuming time with 2 consumers: ${consumingTimeWithTwoConsumers} ms`);
    expect(consumingTimeWithTwoConsumers).toBeLessThan(consumingTimeWithOneConsumer);
  });
});
