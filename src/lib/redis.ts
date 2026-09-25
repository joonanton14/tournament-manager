import { Redis } from "@upstash/redis";

type RedisClient = Pick<Redis, "smembers" | "get" | "set" | "sadd" | "srem" | "del">;

function createMemoryRedis(): RedisClient {
  const data = new Map<string, unknown>();
  const sets = new Map<string, Set<string>>();

  return {
    async smembers(key: string) {
      return [...(sets.get(key) ?? new Set<string>())];
    },
    async get<T>(key: string) {
      const value = data.get(key);
      return value === undefined ? null : (value as T);
    },
    async set<T>(key: string, value: T) {
      data.set(key, value);
      return "OK" as never;
    },
    async sadd(key: string, ...members: string[]) {
      const set = sets.get(key) ?? new Set<string>();

      for (const member of members) {
        set.add(member);
      }

      sets.set(key, set);
      return set.size;
    },
    async srem(key: string, ...members: string[]) {
      const set = sets.get(key);

      if (!set) {
        return 0;
      }

      let removed = 0;

      for (const member of members) {
        if (set.delete(member)) {
          removed += 1;
        }
      }

      if (set.size === 0) {
        sets.delete(key);
      }

      return removed;
    },
    async del(...keys: string[]) {
      let removed = 0;

      for (const key of keys) {
        if (data.delete(key)) {
          removed += 1;
        }

        if (sets.delete(key)) {
          removed += 1;
        }
      }

      return removed;
    },
  } as RedisClient;
}

export const redis: RedisClient = (() => {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.warn("KV_REST_API_URL/KV_REST_API_TOKEN missing; using in-memory Redis fallback.");
    return createMemoryRedis();
  }

  return new Redis({
    url,
    token,
  }) as RedisClient;
})();