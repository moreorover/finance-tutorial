"use client";

import { usePathname } from "next/navigation";
import { NavButton } from "./nav-button";

const routes = [
  { href: "/", label: "Overview" },
  { href: "/transactions", label: "Transactions" },
];

export const Navigation = () => {
  const pathName = usePathname();
  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
      {routes.map((route) => (
        <NavButton
          key={route.href}
          href={route.href}
          label={route.label}
          isActive={pathName === route.href}
        />
      ))}
    </nav>
  );
};
