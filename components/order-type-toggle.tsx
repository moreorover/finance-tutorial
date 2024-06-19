"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function OrderTypeToggle({ value, onChange, disabled }: Props) {
  const [orderType, setOrderType] = useState(value);
  const handleToggle = (value: string) => {
    setOrderType(value);
    onChange(value);
  };
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium">Order Type:</span>
      <Switch
        id="order-type"
        disabled={disabled}
        checked={orderType === "Purchase"}
        onCheckedChange={() =>
          handleToggle(orderType === "Purchase" ? "Sale" : "Purchase")
        }
        className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${orderType === "Purchase" ? "translate-x-5" : "translate-x-0"} `}
        />
      </Switch>
      <span className="text-sm font-medium">
        {orderType === "Purchase" ? "Purchase" : "Sale"}
      </span>
    </div>
  );
}
