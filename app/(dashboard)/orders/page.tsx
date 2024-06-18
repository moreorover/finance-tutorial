import { validateRequest } from "@/lib/auth/validate-request";
import { redirect } from "next/navigation";
import { Paths } from "@/lib/constants";
import Orders from "./orders";

const OrdersPage = async () => {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return <Orders />;
};

export default OrdersPage;
