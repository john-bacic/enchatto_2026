import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup stale participants",
  { seconds: 10 },
  internal.participants.cleanupStaleParticipants
);

export default crons;
