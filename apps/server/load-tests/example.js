import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL } from './config.js';

export const options = {
  iterations: 10,
};

export default function () {
  const res = http.get(BASE_URL);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
