import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { TelemetryData } from '@/types/telemetryData';


export function useTelemetry(deviceIds: string, periodSec: number = 30) {
  const { data, error, isLoading } = useSWR<{ data: TelemetryData[] }>(`/api/telemetry/${deviceIds}?period_sec=${periodSec}`, fetcher, {
    refreshInterval: 1000,
  });

  return {
    data: data ?? [],
    isLoading,
    isError: !!error,
  };
}
