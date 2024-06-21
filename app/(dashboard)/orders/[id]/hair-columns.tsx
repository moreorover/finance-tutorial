"use client";

import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HairActions } from "./hairActions";
import { formatCurrency } from "@/lib/utils";

export type ResponseType = InferResponseType<
  (typeof client.api.hair)[":id"]["$get"],
  200
>["data"];

export const hairColumns: ColumnDef<ResponseType>[] = [
  {
    accessorKey: "upc",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          UPC
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span>{row.original.upc}</span>;
    },
  },
  {
    accessorKey: "length",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Length
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Badge variant="primary" className="px-3.5 py-2.5 text-xs font-medium">
          {row.original.length}
        </Badge>
      );
    },
  },
  {
    accessorKey: "weight",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Weight
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Badge variant="primary" className="px-3.5 py-2.5 text-xs font-medium">
          {row.original.weight}
        </Badge>
      );
    },
  },
  {
    accessorKey: "weightInStock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Weight In Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Badge variant="primary" className="px-3.5 py-2.5 text-xs font-medium">
          {row.original.weightInStock}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return (
        <Badge
          variant={price < 0 ? "destructive" : "primary"}
          className="px-3.5 py-2.5 text-xs font-medium"
        >
          {formatCurrency(price)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <HairActions id={row.original.id} />,
  },
];
