export type Player = {
  id: string;
  name: string;
  nickname?: string;
  createdAt: string;
};

export type Team = {
  id: string;
  name: string;
  createdAt: string;
};

export type Tournament = {
  id: string;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type TournamentTeam = {
  id: string;
  tournamentId: string;
  teamId: string;
  playerIds: string[];
};

export type TournamentStanding = {
  id: string;
  tournamentId: string;
  tournamentTeamId: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  createdAt: string;
};

export type PlayoffFormat =
  | "four_team"
  | "two_semifinals";

export type PlayoffStage =
  | "semi_final"
  | "final";

export type PlayoffTie = {
  id: string;
  tournamentId: string;
  stage: PlayoffStage;
  number: number;
  teamAId: string;
  teamBId: string;
  leg1TeamAScore: number | null;
  leg1TeamBScore: number | null;
  leg2TeamAScore: number | null;
  leg2TeamBScore: number | null;
  createdAt: string;
};