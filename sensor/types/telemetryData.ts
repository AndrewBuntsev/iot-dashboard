export interface TelemetryData {
    device_id: string;
    temperature: number;
    humidity: number;
    air_pollution: number;
    pressure: number;
    timestamp_epoch: number;
    timestamp_iso: string;
};
