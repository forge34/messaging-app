export const randomIp = () =>
  Math.floor(Math.random() * 255) +
  1 +
  "." +
  Math.floor(Math.random() * 255) +
  "." +
  Math.floor(Math.random() * 255) +
  "." +
  Math.floor(Math.random() * 255);

export function last<T>(array: Array<T>): T {
  return array[array.length - 1];
}
