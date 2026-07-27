import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Was every 10s (~8.6k calls/day) even with zero rooms — hourly is enough.
crons.interval(
  "cleanup stale participants",
  { hours: 1 },
  internal.participants.cleanupStaleParticipants
);

export default crons;
