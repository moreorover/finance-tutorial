import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return (
    <div>
      <p>Dashboard page</p>
    </div>
  );
}
