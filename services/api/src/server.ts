import "dotenv/config";
import { buildApp } from "./app.js";

const app = buildApp();
const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: process.env.HOST ?? "0.0.0.0" });
