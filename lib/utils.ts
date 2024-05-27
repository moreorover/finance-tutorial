import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertAmountFromMiliunits(amount: number) {
  return amount / 100;
}

export function convertAmountToMiliunits(amount: number) {
  return Math.round(amount * 100);
}

export function formatCurrency(value: number, currency: string | null) {
  return Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency ? currency : "GBP",
    minimumFractionDigits: 2,
    currencyDisplay: "narrowSymbol",
  }).format(value);
}
