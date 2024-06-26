import { Hono } from "hono";
import { handle } from "hono/vercel";

import accounts from "./accounts";
import accountTags from "./accountTags";
import auth from "./auth";
import hair from "./hair";
import hairTransactions from "./hairTransactions";
import orders from "./orders";
import transactions from "./transactions";

export const runtime = "edge";

const app = new Hono().basePath("/api");

const routes = app
  .route("/auth", auth)
  .route("/accounts", accounts)
  .route("/accountTags", accountTags)
  .route("/transactions", transactions)
  .route("/hair", hair)
  .route("/hairTransactions", hairTransactions)
  .route("/orders", orders);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
