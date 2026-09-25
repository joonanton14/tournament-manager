import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { redis } from "./redis";
import { MAX_MATCHES_PER_PAIR, getFixtureMatchCount, updateTournamentMatch } from "./matches";

describe("repeated team fixtures", () => {
  it("counts the same matchup in either order", () => {
    const matches = [
      { teamAId: "team-1", teamBId: "team-2" },
      { teamAId: "team-2", teamBId: "team-1" },
      { teamAId: "team-1", teamBId: "team-2" },
      { teamAId: "team-2", teamBId: "team-1" },
    ];

    assert.equal(getFixtureMatchCount(matches, "team-1", "team-2"), 4);
  });

  it("allows up to four total games between the same teams", () => {
    const matches = Array.from({ length: MAX_MATCHES_PER_PAIR }, (_, index) => ({
      teamAId: index % 2 === 0 ? "team-1" : "team-2",
      teamBId: index % 2 === 0 ? "team-2" : "team-1",
    }));

    assert.equal(getFixtureMatchCount(matches, "team-1", "team-2"), MAX_MATCHES_PER_PAIR);
  });

  it("updates a saved match score without changing the teams", async () => {
    await redis.set("tournamentMatch:match-1", {
      id: "match-1",
      tournamentId: "tournament-1",
      teamAId: "team-1",
      teamBId: "team-2",
      teamAScore: 1,
      teamBScore: 0,
      playedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    const match = await updateTournamentMatch("match-1", 2, 1);

    assert.equal(match.id, "match-1");
    assert.equal(match.teamAId, "team-1");
    assert.equal(match.teamBId, "team-2");
    assert.equal(match.teamAScore, 2);
    assert.equal(match.teamBScore, 1);
  });
});
