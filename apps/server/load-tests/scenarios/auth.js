import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const USER_COUNT = 50;

export const options = {
  stages: [
    { target: 10, duration: '20s' },
    { target: 25, duration: '30s' },
    { target: 50, duration: '40s' },
    { target: 50, duration: '30s' },
    { target: 0, duration: '10s' },
  ],
  thresholds: {
    'http_req_duration{ name:login }': ['p(95)<2000'],
    'http_req_failed{ name:login }': ['rate<0.01'],
  },
};

export function setup() {
  const credentials = [];
  for (let i = 0; i < USER_COUNT; i++) {
    const username = `loaduser_${i}`;
    const password = 'TestPass123!';
    const payload = JSON.stringify({
      username,
      password,
      confirmPassword: password,
    });
    const res = http.post(`${BASE_URL}/signup`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'signup' },
    });
    check(res, {
      'signup created or already exists': (r) =>
        r.status === 200 || r.status === 409,
    });
    credentials.push({ username, password });
  }
  return credentials;
}

export default function (data) {
  const { username, password } = data[(__VU - 1) % data.length];

  const payload = JSON.stringify({ username, password });
  const res = http.post(`${BASE_URL}/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' },
  });

  if (res.status !== 200 && res.status !== 201) {
    console.log(`Unexpected status: ${res.status} — ${res.body}`);
  }
  check(res, {
    'login success': (r) => r.status === 200 || r.status === 201,
    'jwt cookie set': (r) => r.cookies.jwt && r.cookies.jwt.length > 0,
  });
}
