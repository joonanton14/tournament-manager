import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { z } from "zod";

const tournamentSchema = z
  .object({
    number: z.coerce.number().int().min(1),
    name: z.string().trim().min(1).max(100),
    mode: z.enum(["completed", "live"]),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before the start date.",
    path: ["endDate"],
  });

describe("tournament validation", () => {
  it("accepts live tournaments with valid dates", () => {
    const result = tournamentSchema.safeParse({
      number: 1,
      name: "Live tournament",
      mode: "live",
      startDate: "2026-09-25T18:00",
      endDate: "2026-09-25T22:00",
    });

    assert.equal(result.success, true);
  });

  it("requires dates for live tournaments", () => {
    const result = tournamentSchema.safeParse({
      number: 1,
      name: "Live tournament",
      mode: "live",
      startDate: "",
      endDate: "",
    });

    assert.equal(result.success, false);
  });
});
