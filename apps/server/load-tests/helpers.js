import http from 'k6/http';
import { check } from 'k6';

export function randomString(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function signupUser(baseUrl, prefix) {
  const username = `${prefix}-${randomString(8)}`;
  const password = 'LoadTest123';
  const payload = JSON.stringify({
    username,
    password,
    confirmPassword: password,
  });

  const res = http.post(`${baseUrl}/signup`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'signup' },
  });

  check(res, { 'signup ok': (r) => r.status === 201 || r.status === 200 });
  return { username, password };
}

export function loginUser(baseUrl, username, password) {
  const payload = JSON.stringify({ username, password });
  const res = http.post(`${baseUrl}/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' },
  });

  check(res, { 'login ok': (r) => r.status === 200 || r.status === 201 });

  const jar = http.cookieJar();
  const cookies = jar.cookiesForURL(baseUrl);
  return { jwt: cookies.jwt ? cookies.jwt[0] : null };
}
