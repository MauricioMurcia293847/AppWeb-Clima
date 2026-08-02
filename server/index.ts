import { createApp } from "./app.js";
import { observeServerStarted } from "./observability.js";

const app = createApp();
const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  observeServerStarted(port);
});
