import { Request, Response, NextFunction } from 'express';
import { execQuery } from '../dbClient';

export const getTelemetry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Support comma-separated device IDs
    const deviceIds = req.params.device_ids.split(',');
    const deviceIdList = deviceIds.map(id => `'${id}'`).join(', ');

    // Handle optional period_sec query param
    let timeFilter = '';
    if (req.query.period_sec) {
      const now = Math.floor(Date.now() / 1000);
      const from = now - parseInt(req.query.period_sec as string, 10);
      timeFilter = ` AND timestamp_epoch >= ${from}`;
    }

    const query = `
      SELECT device_id, temperature, humidity, air_pollution, pressure, timestamp_epoch, timestamp_iso
      FROM \`telemetry\`
      WHERE device_id IN [${deviceIdList}] ${timeFilter}
      ORDER BY timestamp_epoch DESC
      LIMIT 500
    `;
    console.log('Executing query:', query);
    
    const result = await execQuery(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

