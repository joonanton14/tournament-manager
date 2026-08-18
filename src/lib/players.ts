import { redis } from "@/lib/redis";
import type { Player } from "@/types";

const PLAYERS_KEY = "players";

function playerKey(id: string) {
  return `player:${id}`;
}

export async function getPlayers(): Promise<Player[]> {
  const ids = await redis.smembers(PLAYERS_KEY);

  if (!ids.length) {
    return [];
  }

  const players = await Promise.all(
    ids.map((id) => redis.get<Player>(playerKey(id))),
  );

  return players
    .filter((player): player is Player => player !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPlayerById(id: string): Promise<Player | null> {
  return redis.get<Player>(playerKey(id));
}

export async function createPlayer(
  name: string,
  nickname?: string,
): Promise<Player> {
  const trimmedName = name.trim();
  const trimmedNickname = nickname?.trim();

  if (!trimmedName) {
    throw new Error("Player name is required.");
  }

  const player: Player = {
    id: crypto.randomUUID(),
    name: trimmedName,
    ...(trimmedNickname ? { nickname: trimmedNickname } : {}),
    createdAt: new Date().toISOString(),
  };

  await redis.set(playerKey(player.id), player);
  await redis.sadd(PLAYERS_KEY, player.id);

  return player;
}

export async function updatePlayer(
  id: string,
  name: string,
  nickname?: string,
): Promise<Player> {
  const existingPlayer = await getPlayerById(id);

  if (!existingPlayer) {
    throw new Error("Player not found.");
  }

  const trimmedName = name.trim();
  const trimmedNickname = nickname?.trim();

  if (!trimmedName) {
    throw new Error("Player name is required.");
  }

  const player: Player = {
    ...existingPlayer,
    name: trimmedName,
    ...(trimmedNickname ? { nickname: trimmedNickname } : {}),
  };

  await redis.set(playerKey(id), player);

  return player;
}

export async function deletePlayer(id: string): Promise<void> {
  await redis.del(playerKey(id));
  await redis.srem(PLAYERS_KEY, id);
}