import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <p>Dashboard page</p>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
