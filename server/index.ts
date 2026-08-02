import { createApp } from "./app";
import { observeServerStarted } from "./observability";

const app = createApp();
const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  observeServerStarted(port);
});
