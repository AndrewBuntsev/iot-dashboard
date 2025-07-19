import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { TelemetryChartData } from '@/types/telemetryData';


export default function TelemetryChart({ title, data, min, max, units }: { title: string; data: TelemetryChartData, min: number, max: number, units: string }) {
  return (
    <div>
        <div style={{ textAlign: 'center', marginBottom: 8, fontWeight: 500 }}>{title}</div>
        <LineChart
            height={300}
            series={data.data}
            xAxis={[{ scaleType: 'band', data: data.labels }]}
            yAxis={[{ width: 50, min, max, label: units }]}
            margin={{ right: 24 }}
            showToolbar={true}
        />
    </div>
  );
}