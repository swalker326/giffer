import process from "node:process";
import { remixFastify } from "@mcansh/remix-fastify";
// import { installGlobals } from "@remix-run/node";
import { fastify } from "fastify";
import sourceMapSupport from "source-map-support";

// installGlobals();
sourceMapSupport.install();

const app = fastify();

await app.register(remixFastify);

const port = Number(process.env.PORT) || 3000;
// TODO: Fix this, when deploying we need to go to 0.0.0.0 and locally we need to go to go to 127
// const host = process.env.HOST === "true" ? "0.0.0.0" : "127.0.0.1";
const host = "0.0.0.0";

const address = await app.listen({ port, host });
console.log(`✅ app ready: ${address}`);