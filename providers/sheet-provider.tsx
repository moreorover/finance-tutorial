"use client";

import { useMountedState } from "react-use";

import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";
import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditAccountTagSheet } from "@/features/accountTags/components/edit-accountTag-sheet";
import { NewAccountTagSheet } from "@/features/accountTags/components/new-accountTag-sheet";

export const SheetProvider = () => {
  const isMounted = useMountedState();

  if (!isMounted) return null;

  return (
    <>
      <NewAccountSheet />
      <EditAccountSheet />
      <EditAccountTagSheet />
      <NewAccountTagSheet />
    </>
  );
};
