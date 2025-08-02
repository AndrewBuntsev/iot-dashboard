import { Request, Response, NextFunction } from 'express';
import { QueryOptions } from 'couchbase';
import { QueryParam } from '../types/queryParam';
import { execQuery } from '../dbClient';


export const getTelemetry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryOptions: QueryOptions = {
      parameters: {},
    }
    // Support comma-separated device IDs
    const deviceIds = req.params.device_ids.split(',');
    if (deviceIds.length === 0) {
      return res.status(400).json({ error: 'No device IDs provided' });
    }
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

    queryOptions.parameters = params;
    queryOptions.adhoc = req.query.adhoc === 'true';

    const query = `
      SELECT device_id, temperature, humidity, air_pollution, pressure, timestamp_epoch, timestamp_iso
      FROM \`${process.env.COUCHBASE_BUCKET}\`
      WHERE device_id IN $deviceIds${timeFilter}
      ORDER BY timestamp_epoch DESC
    `;
    
    console.log('Executing query:', query);
    console.log('... with options:', queryOptions);
    const result = await execQuery(query, queryOptions);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
