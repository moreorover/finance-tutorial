import { Hono } from "hono";
import { handle } from "hono/vercel";

import accounts from "./accounts";
import accountTags from "./accountTags";
import hair from "./hair";
import orders from "./orders";
import transactions from "./transactions";

export const runtime = "edge";

const app = new Hono().basePath("/api");

const routes = app
  .route("/accounts", accounts)
  .route("/accountTags", accountTags)
  .route("/transactions", transactions)
  .route("/hair", hair)
  .route("/orders", orders);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
