"use client";

import { useMountedState } from "react-use";

import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";
import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditAccountTagSheet } from "@/features/accountTags/components/edit-accountTag-sheet";
import { NewAccountTagSheet } from "@/features/accountTags/components/new-accountTag-sheet";
import { NewTransactionSheet } from "@/features/transactions/components/new-transaction-sheet";
import { EditTransactionSheet } from "@/features/transactions/components/edit-transaction-sheet";
import { EditOrderSheet } from "@/features/orders/components/edit-order-sheet";
import { NewOrderSheet } from "@/features/orders/components/new-order-sheet";
import { EditHairSheet } from "@/features/hair/components/edit-hair-sheet";
import { NewHairSheet } from "@/features/hair/components/new-hair-sheet";
import { EditHairTransactionSheet } from "@/features/hairTransactions/components/edit-hairTransaction-sheet";
import { NewHairTransactionSheet } from "@/features/hairTransactions/components/new-hairTransaction-sheet";

export const SheetProvider = () => {
  const isMounted = useMountedState();

  if (!isMounted) return null;

  return (
    <>
      <NewAccountSheet />
      <EditAccountSheet />

      <EditAccountTagSheet />
      <NewAccountTagSheet />

      <EditTransactionSheet />
      <NewTransactionSheet />

      <EditOrderSheet />
      <NewOrderSheet />

      <EditHairSheet />
      <NewHairSheet />

      <EditHairTransactionSheet />
      <NewHairTransactionSheet />
    </>
  );
};
