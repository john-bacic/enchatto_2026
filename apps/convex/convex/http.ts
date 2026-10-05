import { httpRouter } from "convex/server";
import { registerRoomRoutes } from "./httpRooms";
import { registerMessageRoutes } from "./httpMessages";
import { registerGameRoutes } from "./httpGames";
import { registerEmojifyrRoutes } from "./httpEmojifyr";
import { registerEmojiMatchRoutes } from "./httpEmojiMatch";
import { registerTruthOrDareRoutes } from "./httpTruthOrDare";
import { registerEmojiBingoRoutes } from "./httpEmojiBingo";
import { registerWordRushRoutes } from "./httpWordRush";

// Each area's routes live in its own http*.ts file; this file only puts them on the one router.
// Convex takes the router from this file's default export.
const http = httpRouter();

registerRoomRoutes(http);
registerMessageRoutes(http);
registerGameRoutes(http);
registerEmojifyrRoutes(http);
registerEmojiMatchRoutes(http);
registerTruthOrDareRoutes(http);
registerEmojiBingoRoutes(http);
registerWordRushRoutes(http);

export default http;
