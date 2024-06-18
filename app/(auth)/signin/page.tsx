import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { Login } from "./signin";

export const metadata = {
  title: "Login",
  description: "Login Page",
};

export default async function SigninPage() {
  const { user } = await validateRequest();

  if (user) redirect(Paths.Home);

  return <Login />;
}
