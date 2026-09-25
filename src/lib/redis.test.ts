import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("redis client", () => {
  it("falls back to an in-memory store when env vars are missing", async () => {
    const originalUrl = process.env.KV_REST_API_URL;
    const originalToken = process.env.KV_REST_API_TOKEN;

    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    try {
      const { redis } = await import("./redis");
      await redis.set("fallback:test", { ok: true });
      const value = await redis.get<{ ok: boolean }>("fallback:test");
      assert.deepEqual(value, { ok: true });
    } finally {
      if (originalUrl === undefined) delete process.env.KV_REST_API_URL;
      else process.env.KV_REST_API_URL = originalUrl;

      if (originalToken === undefined) delete process.env.KV_REST_API_TOKEN;
      else process.env.KV_REST_API_TOKEN = originalToken;
    }
  });
});
