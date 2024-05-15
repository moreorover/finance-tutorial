"use client";

import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

export default function Home() {
  const accountsQuery = useGetAccounts();
  return (
    <div>
      <p>Dashboard page</p>
      <div>
        {accountsQuery.data?.map((account) => (
          <div key={account.id}>{account.name}</div>
        ))}
      </div>
    </div>
  );
}
