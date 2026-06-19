import { createApp } from "./app";

const app = createApp();
const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`AppWeb Clima API escuchando en http://127.0.0.1:${port}`);
});
