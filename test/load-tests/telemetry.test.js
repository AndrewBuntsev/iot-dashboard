import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { check, sleep } from 'k6';

const API_BASE_URL = `http://host.docker.internal:4000`;

// Custom trends to track response durations
const adhocTrueDuration = new Trend('adhoc_true_duration');
const adhocFalseDuration = new Trend('adhoc_false_duration');

export const options = {
  scenarios: {
    adhoc_true: {
      executor: 'constant-vus',
      vus: 1,
      duration: '20s',
      exec: 'testAdhocTrue',
    },
    adhoc_false: {
      executor: 'constant-vus',
      vus: 1,
      duration: '20s',
      exec: 'testAdhocFalse',
    },
  },
};

export function testAdhocTrue() {
  const res = http.get(`${API_BASE_URL}/api/telemetry/Living_Room?period_sec=100000&adhoc=true`);
  // log number of fetched items
  adhocTrueDuration.add(res.timings.duration);
  console.log(`[adhoc=true] Fetched: ${res.json().length}`);
  check(res, {
    '[adhoc=true] status is 200': (r) => r.status === 200,
    '[adhoc=true] response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  sleep(2);
}

export function testAdhocFalse() {
  const res = http.get(`${API_BASE_URL}/api/telemetry/Living_Room?period_sec=100000&adhoc=false`);
  // log number of fetched items
  console.log(`Fetched items: ${res.json().length}`);
  adhocFalseDuration.add(res.timings.duration);
  console.log(`[adhoc=false] Fetched: ${res.json().length}`);
  check(res, {
    '[adhoc=false] status is 200': (r) => r.status === 200,
    '[adhoc=false] response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  sleep(2);
}
