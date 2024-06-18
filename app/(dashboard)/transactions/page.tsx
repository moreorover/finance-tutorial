import { validateRequest } from "@/lib/auth/validate-request";
import { redirect } from "next/navigation";
import { Paths } from "@/lib/constants";
import Transactions from "./transactions";

const TransactionsPage = async () => {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return <Transactions />;
};

export default TransactionsPage;
