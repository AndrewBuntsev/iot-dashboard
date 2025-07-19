export interface TelemetryData {
    device_id: string;
    temperature: number;
    humidity: number;
    air_pollution: number;
    pressure: number;
    timestamp_epoch: number;
    timestamp_iso: string;
};

export interface ChartSeries {
    data: number[];
    label: string;
}

export interface TelemetryChartData {
    labels: string[];
    data: ChartSeries[];
}

export type MetricType = 'temperature' | 'humidity' | 'air_pollution' | 'pressure';