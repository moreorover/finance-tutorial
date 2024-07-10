"use client";

import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";
import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditAccountTagSheet } from "@/features/accountTags/components/edit-accountTag-sheet";
import { NewAccountTagSheet } from "@/features/accountTags/components/new-accountTag-sheet";
import { useGetHairs } from "@/features/hair/api/use-get-hairs";
import { EditHairSheet } from "@/features/hair/components/edit-hair-sheet";
import { NewHairSheet } from "@/features/hair/components/new-hair-sheet";
import { EditHairTransactionSheet } from "@/features/hairTransactions/components/edit-hairTransaction-sheet";
import { NewHairTransactionSheet } from "@/features/hairTransactions/components/new-hairTransaction-sheet";
import { EditOrderSheet } from "@/features/orders/components/edit-order-sheet";
import { NewOrderSheet } from "@/features/orders/components/new-order-sheet";
import { EditTransactionSheet } from "@/features/transactions/components/edit-transaction-sheet";
import { NewTransactionSheet } from "@/features/transactions/components/new-transaction-sheet";
import { useMountedState } from "react-use";

export const SheetProvider = () => {
  const accountsQuery = useGetAccounts();
  const hairsQuery = useGetHairs();

  const isMounted = useMountedState();

  if (!isMounted) return null;

  return (
    <>
      <NewAccountSheet />
      <EditAccountSheet />

      <EditAccountTagSheet />
      <NewAccountTagSheet />

      <EditTransactionSheet accountsQuery={accountsQuery} />
      <NewTransactionSheet accountsQuery={accountsQuery} />

      <EditOrderSheet accountsQuery={accountsQuery} />
      <NewOrderSheet accountsQuery={accountsQuery} />

      <EditHairSheet />
      <NewHairSheet />

      <EditHairTransactionSheet hairsQuery={hairsQuery} />
      <NewHairTransactionSheet hairInStock={hairsQuery} />
    </>
  );
};
