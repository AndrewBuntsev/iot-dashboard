import http from 'k6/http';
import { check, sleep } from 'k6';

const API_BASE_URL = `http://api:4000`;

export const options = {
  vus: 10,           
  duration: '10s',
};

export default function () {
  const res = http.get(`${API_BASE_URL}/api/telemetry/Living_Room?period_sec=1500`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
