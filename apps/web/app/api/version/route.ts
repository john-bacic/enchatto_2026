// Built per deployment, so each deploy answers with its own SHA
export const dynamic = "force-static";

export function GET() {
  return Response.json({ sha: process.env.NEXT_PUBLIC_GIT_SHA ?? "dev" });
}
