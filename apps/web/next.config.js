const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getGitSHA() {
  // 1. Vercel auto-populates this when deploying from GitHub
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  // 2. Stamped by deploy script (CLI deploys have no .git on Vercel)
  const shaFile = path.join(__dirname, ".git-sha");
  if (fs.existsSync(shaFile)) return fs.readFileSync(shaFile, "utf-8").trim();
  // 3. Local dev — read from git directly
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "dev";
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GIT_SHA: getGitSHA(),
  },
};

module.exports = nextConfig;
