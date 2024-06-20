"use client";

import OrderTypeToggle from "@/components/order-type-toggle";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const onChange = (value: string) => {
    console.log("value => " + value);
  };

  return (
    <div>
      <OrderTypeToggle onChange={onChange} value="purchase" disabled={false} />
      <OrderTypeToggle onChange={onChange} value="sale" disabled={true} />
      <Input type="number" />
    </div>
  );
}
