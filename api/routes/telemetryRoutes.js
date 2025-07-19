import { Router } from 'express';
import * as telemetryController from '../controllers/telemetryController.js';

const router = Router();

router.get('/:device_ids', telemetryController.getTelemetry);

export { router as telemetryRoutes }; 