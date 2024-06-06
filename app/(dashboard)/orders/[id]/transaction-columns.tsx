"use client";

import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, TriangleAlert } from "lucide-react";
import { Actions } from "./actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export type ResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["$get"],
  200
>["data"]["transactions"];

export const columns: ColumnDef<ResponseType>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;

      return <span>{format(date, "dd MMMM, yyyy")}</span>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span>
          {!row.original.type && (
            <TriangleAlert className="mr-2 size-4 shrink-0" />
          )}
          {row.original.type || "Uncategorized"}
        </span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));

      return (
        <Badge
          variant={amount < 0 ? "destructive" : "primary"}
          className="px-3.5 py-2.5 text-xs font-medium"
        >
          {formatCurrency(amount, row.original.currency)}
        </Badge>
      );
    },
  },
  // {
  //   accessorKey: "notes",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         Notes
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  //   cell: ({ row }) => {
  //     return <span>{row.getValue("notes")}</span>;
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => <Actions id={row.original.id} />,
  },
];
