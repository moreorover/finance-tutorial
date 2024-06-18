import { validateRequest } from "@/lib/auth/validate-request";
import { redirect } from "next/navigation";
import { Paths } from "@/lib/constants";
import AccountTags from "./accountTags";

const AccountTagsPage = async () => {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);
  return <AccountTags />;
};

export default AccountTagsPage;
