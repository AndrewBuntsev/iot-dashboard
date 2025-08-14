import { vary, generateTelemetry } from './telemetryGenerator';

describe('vary', () => {
  it('should keep vary value within min and max', () => {
    for (let i = 0; i < 100; i++) {
      const result = vary(20, 18, 28);
      expect(result).toBeGreaterThanOrEqual(18);
      expect(result).toBeLessThanOrEqual(28);
    }
  });

  it('should return a valid telemetry payload', () => {
    const payload = generateTelemetry("dev1");
    
    // expect payload to be interface TelemetryData
    expect(payload).toEqual(expect.objectContaining({
      device_id: expect.any(String),
      temperature: expect.any(Number),
      humidity: expect.any(Number),
      air_pollution: expect.any(Number),
      pressure: expect.any(Number),
      timestamp_epoch: expect.any(Number),
      timestamp_iso: expect.any(String),
    }));
  });
});