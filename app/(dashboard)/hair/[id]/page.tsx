import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import Hair from "./hair";

export default async function Home({ params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  if (!params.id) {
    redirect(Paths.Dashboard);
  }
  return (
    <div>
      <Hair id={params.id} />
    </div>
  );
}
