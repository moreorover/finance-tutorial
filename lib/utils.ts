import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
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

export function formatDateStampString(
  timestamp: string,
  outputFormat: string,
): string {
  if (timestamp && outputFormat) {
    return format(new Date(timestamp), outputFormat);
  }

  return format(new Date(), "d MMMM yyyy");
}

export function convertAmountToPossitive(amount: number) {
  return Math.abs(amount);
}
