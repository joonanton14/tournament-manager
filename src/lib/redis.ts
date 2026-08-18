import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL;
const token = process.env.KV_REST_API_TOKEN;

if (!url) {
  throw new Error("KV_REST_API_URL is not configured.");
}

if (!token) {
  throw new Error("KV_REST_API_TOKEN is not configured.");
}

export const redis = new Redis({
  url,
  token,
});