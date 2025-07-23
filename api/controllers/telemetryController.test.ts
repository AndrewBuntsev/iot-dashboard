jest.mock('@/dbClient', () => ({
  execQuery: jest.fn().mockResolvedValue([{ device_id: 'dev1', temperature: 22 }])
}));

import { getTelemetry } from './telemetryController';

describe('telemetryController', () => {
  it('should be a function', () => {
    expect(typeof getTelemetry).toBe('function');
  });

  it('should return a promise when called', () => {
    const req = { params: { device_ids: 'dev1' }, query: {} } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    const result = getTelemetry(req, res, next);
    expect(result).toBeInstanceOf(Promise);
  });

  it('should call res.status and res.json on success', async () => {
    const req = { params: { device_ids: 'dev1' }, query: {} } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();

    await getTelemetry(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ device_id: 'dev1', temperature: 22 }]);
  });
});
