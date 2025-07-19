'use client';

import { useTelemetry } from '@/hooks/useTelemetry';
import TelemetryChart from './TelemetryChart';
import { MetricType, TelemetryChartData, TelemetryData } from '@/types/telemetryData';
import { ChartSeries } from '@/types/telemetryData';


const getDeviceData = (data: TelemetryData[], metric: MetricType, deviceId: string): number[] => {
  return data
    .filter((d) => d.device_id === deviceId)
    .sort((a, b) => a.timestamp_epoch - b.timestamp_epoch)
    .map((d) => d[metric]);
};

const getMetricChartData = (data: TelemetryData[], metric: MetricType, deviceIds: string[]): TelemetryChartData => {
  const devicesData: ChartSeries[] = deviceIds.map((deviceId) => ({
    data: getDeviceData(data, metric, deviceId),
    label: deviceId,
    showMark: false
  }));
    
  return {
    labels: Array.from(new Set(data
      .sort((a, b) => a.timestamp_epoch - b.timestamp_epoch)
      .map(d => d.timestamp_iso.split('T')[1].slice(0, 8)))),
    data: devicesData
  };
}


export default function ChartsDashboard({ devices }: { devices: string[] }) {
  const { data, isLoading, isError } = useTelemetry(devices.join(','));

  if (isLoading || !data) return <p>Loading...</p>;
  if (isError) return <p>Failed to load telemetry data.</p>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', gap: 24, width: '100%' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TelemetryChart
            title="Temperature"
            data={getMetricChartData(data as TelemetryData[], 'temperature', devices)}
            min={18}
            max={28}
            units="°C"
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TelemetryChart
            title="Humidity"
            data={getMetricChartData(data as TelemetryData[], 'humidity', devices)}
            min={40}
            max={90}
            units="%"
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24, width: '100%' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TelemetryChart
            title="Air Pollution"
            data={getMetricChartData(data as TelemetryData[], 'air_pollution', devices)}
            min={10}
            max={100}
            units="AQI"
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TelemetryChart
            title="Pressure"
            data={getMetricChartData(data as TelemetryData[], 'pressure', devices)}
            min={690}
            max={810}
            units="hPa"
          />
        </div>
      </div>
    </div>
  );
}
