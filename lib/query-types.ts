import { UseQueryResult } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { client } from "./hono";

export type useGetAccountsQueryType = UseQueryResult<
  InferResponseType<typeof client.api.accounts.$get, 200>["data"],
  Error
>;

export type useGetHairsQueryType = UseQueryResult<
  InferResponseType<typeof client.api.hair.$get, 200>,
  Error
>;
