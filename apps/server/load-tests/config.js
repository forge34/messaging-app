export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const WS_URL = __ENV.WS_URL || 'ws://localhost:3000';

export const PASSWORD = 'LoadTest123';

export const DURATION = __ENV.DURATION || '30s';

export const STAGES = [
  { duration: '10s', target: 10 },
  { duration: '20s', target: 50 },
  { duration: '10s', target: 0 },
];

export const THRESHOLDS = {
  http_req_duration: ['p(95)<1000'],
  http_req_failed: ['rate<0.01'],
};
