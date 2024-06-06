import { Hono } from "hono";
import { handle } from "hono/vercel";
import { HTTPException } from "hono/http-exception";
import accounts from "./accounts";
import accountTags from "./accountTags";
import hair from "./hair";
import orders from "./orders";
import transactions from "./transactions";
export const runtime = "edge";

const app = new Hono().basePath("/api");

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json({ error: "Internal error" }, 500);
});

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
