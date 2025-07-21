import { Request, Response, NextFunction } from 'express';
import { QueryParam } from '../types/queryParam';
import { execQuery } from '../dbClient';

export const getTelemetry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Support comma-separated device IDs
    const deviceIds = req.params.device_ids.split(',');

    const params: QueryParam = {
      deviceIds
    };

    // Handle optional period_sec query param
    let timeFilter = '';
    if (req.query.period_sec) {
      const now = Math.floor(Date.now() / 1000);
      const from = now - parseInt(req.query.period_sec as string, 10);
      params.from = from;
      timeFilter = ' AND timestamp_epoch >= $from';
    }

    const query = `
      SELECT device_id, temperature, humidity, air_pollution, pressure, timestamp_epoch, timestamp_iso
      FROM \`${process.env.COUCHBASE_BUCKET}\`
      WHERE device_id IN $deviceIds${timeFilter}
      ORDER BY timestamp_epoch DESC
      LIMIT 500
    `;
    
    console.log('Executing query:', query);
    console.log('... with params:', params);
    const result = await execQuery(query, params);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
