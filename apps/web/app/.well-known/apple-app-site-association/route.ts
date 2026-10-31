// Universal links: a join link opens the iPhone app where it is installed (Associated Domains in
// apps/ios/Enchatto.entitlements), and this page everywhere else. Apple's CDN fetches the file, from the
// production domain only, and wants JSON with no redirect.
const APP_ID = "V823NAB7CT.com.enchatto.app";

export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      applinks: {
        details: [{ appIDs: [APP_ID], components: [{ "/": "/join/*", comment: "A room's join link" }] }],
      },
    },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
}
