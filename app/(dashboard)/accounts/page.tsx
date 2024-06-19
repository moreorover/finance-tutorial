import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import Accounts from "./accounts";
import { Paths } from "@/lib/constants";

const AccountsPage = async () => {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return <Accounts />;
};

export default AccountsPage;
