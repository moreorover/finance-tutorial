"use client";

import { User } from "lucia";

type Props = {
  user: User;
};

export const WelcomeMsg = ({ user }: Props) => {
  return (
    <div className="mb-4 space-y-2">
      <h2 className="text-2xl font-medium text-white lg:text-4xl">
        Welcome back {user.email}
      </h2>
      <p className="text-sm text-[#89b6fd] lg:text-base">This</p>
    </div>
  );
};
