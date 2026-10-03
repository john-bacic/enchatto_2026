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

crons.interval(
  "sweep stale rate limit rows",
  { hours: 1 },
  internal.participants.sweepRateLimits
);

// Does nothing until PURGE_CLOSED_ROOMS_AFTER_DAYS is set on the deployment. 19:30 UTC is 04:30 in Japan;
// the run only touches rooms closed for days, so it does not compete with live rooms at any hour.
crons.daily(
  "purge closed rooms",
  { hourUTC: 19, minuteUTC: 30 },
  internal.rooms.purgeClosedRooms,
  {}
);

export default crons;
