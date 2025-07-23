import { test, expect, request } from '@playwright/test';

test.describe('Telemetry API', () => {
  test('should return telemetry data for Living_Room', async ({ playwright }) => {
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:4000',
    });

    const response = await apiContext.get('/api/telemetry/Living_Room?period_sec=30');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('device_id', 'Living_Room');
    expect(data[0]).toHaveProperty('timestamp_epoch');
    expect(data[0]).toHaveProperty('timestamp_iso');
    expect(data[0]).toHaveProperty('temperature');
    expect(data[0]).toHaveProperty('humidity');
    expect(data[0]).toHaveProperty('air_pollution');
    expect(data[0]).toHaveProperty('pressure');
  });

  // period_sec is optional, so we can test without it
  test('should return telemetry data for Living_Room without period_sec', async ({ playwright }) => {
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:4000',
    });

    const response = await apiContext.get('/api/telemetry/Living_Room');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('device_id', 'Living_Room');
    expect(data[0]).toHaveProperty('timestamp_epoch');
    expect(data[0]).toHaveProperty('timestamp_iso');
    expect(data[0]).toHaveProperty('temperature');
    expect(data[0]).toHaveProperty('humidity');
    expect(data[0]).toHaveProperty('air_pollution');
    expect(data[0]).toHaveProperty('pressure');
  });

  test('should return telemetry data for Garage', async ({ playwright }) => {
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:4000',
    });

    const response = await apiContext.get('/api/telemetry/Garage?period_sec=30');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('device_id', 'Garage');
    expect(data[0]).toHaveProperty('timestamp_epoch');
    expect(data[0]).toHaveProperty('timestamp_iso');
    expect(data[0]).toHaveProperty('temperature');
    expect(data[0]).toHaveProperty('humidity');
    expect(data[0]).toHaveProperty('air_pollution');
    expect(data[0]).toHaveProperty('pressure');
  });

  // emty for unknown device
  test('should return empty array for unknown device', async ({ playwright }) => {
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:4000',
    });

    const response = await apiContext.get('/api/telemetry/Unknown_Device?period_sec=30');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Expect an empty array for unknown device
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  
  test('should return 404 (Not Found) for missing device_ids', async ({ playwright }) => {
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:4000',
    });

    const response = await apiContext.get('/api/telemetry');

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(404);
  });
});
