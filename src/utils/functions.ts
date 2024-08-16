export const randomIp = () =>
  Math.floor(Math.random() * 255) +
  1 +
  "." +
  Math.floor(Math.random() * 255) +
  "." +
  Math.floor(Math.random() * 255) +
  "." +
  Math.floor(Math.random() * 255);
