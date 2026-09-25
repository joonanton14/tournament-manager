import { deleteTournament } from "./src/lib/tournaments";

if (typeof deleteTournament !== "function") {
  throw new Error("deleteTournament missing");
}
