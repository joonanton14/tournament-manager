import { redis } from "@/lib/redis";
import type { Team } from "@/types";

const TEAMS_KEY = "teams";

function teamKey(id: string) {
  return `team:${id}`;
}

export async function getTeams(): Promise<Team[]> {
  const ids = await redis.smembers(TEAMS_KEY);

  if (!ids.length) {
    return [];
  }

  const teams = await Promise.all(
    ids.map((id) => redis.get<Team>(teamKey(id))),
  );

  return teams
    .filter((team): team is Team => team !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTeamById(id: string): Promise<Team | null> {
  return redis.get<Team>(teamKey(id));
}

export async function createTeam(name: string): Promise<Team> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Team name is required.");
  }

  const team: Team = {
    id: crypto.randomUUID(),
    name: trimmedName,
    createdAt: new Date().toISOString(),
  };

  await redis.set(teamKey(team.id), team);
  await redis.sadd(TEAMS_KEY, team.id);

  return team;
}

export async function updateTeam(
  id: string,
  name: string,
): Promise<Team> {
  const existingTeam = await getTeamById(id);

  if (!existingTeam) {
    throw new Error("Team not found.");
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Team name is required.");
  }

  const team: Team = {
    ...existingTeam,
    name: trimmedName,
  };

  await redis.set(teamKey(id), team);

  return team;
}

export async function deleteTeam(id: string): Promise<void> {
  await redis.del(teamKey(id));
  await redis.srem(TEAMS_KEY, id);
}