// import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { HeaderLogo } from "./header-logo";
import { Navigation } from "./navigation";
import { Loader2 } from "lucide-react";
import { WelcomeMsg } from "./welcome-msg";
import { validateRequest } from "@/lib/auth/validate-request";
import { redirect } from "next/navigation";
import { Paths } from "@/lib/constants";

export const Header = async () => {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-8 pb-36 lg:px-14">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-14 flex w-full items-center justify-between">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          {/* <ClerkLoaded>
            <UserButton afterSignOutUrl="/" />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="size-8 animate-spin text-slate-400" />
          </ClerkLoading> */}
        </div>
        <WelcomeMsg user={user} />
      </div>
    </header>
  );
};
