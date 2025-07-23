import { processMessage } from './messageProcessor';

jest.mock('./dbClient', () => ({
  saveTelemetry: jest.fn().mockResolvedValue(null)
}));

describe('processMessage', () => {
  it('should call saveTelemetry with the payload', async () => {
    const payload = {
      device_id: 'dev1',
      temperature: 22,
      humidity: 55,
      air_pollution: 10,
      pressure: 1012,
      timestamp_epoch: 1234567890,
      timestamp_iso: '2025-07-23T12:00:00.000Z'
    };

    const { saveTelemetry } = require('./dbClient');
    await processMessage(payload);

    expect(saveTelemetry).toHaveBeenCalledWith(payload);
  });
});