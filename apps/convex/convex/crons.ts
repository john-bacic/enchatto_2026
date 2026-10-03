import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Was every 10s (~8.6k calls/day) even with zero rooms — hourly is enough.
crons.interval(
  "cleanup stale participants",
  { hours: 1 },
  internal.participants.cleanupStaleParticipants
);

crons.interval(
  "close rooms whose host is gone",
  { minutes: 5 },
  internal.rooms.closeAbandonedRooms
);

export default crons;
