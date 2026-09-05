import type { ConnectionOptions } from 'bullmq';

export function redisConnectionFromUrl(value: string): ConnectionOptions {
  const url = new URL(value);
  const database = Number(url.pathname.replace('/', '') || 0);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db: Number.isFinite(database) ? database : 0,
    tls: url.protocol === 'rediss:' ? {} : undefined,
  };
}
