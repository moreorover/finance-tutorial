import { env } from "@/env";
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

export function formatCurrency(value: number) {
  return Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
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

export function convertNumberToPossitive(number: number) {
  return Math.abs(number);
}

export function convertNumberToNegative(number: number) {
  return -Math.abs(number);
}

export function absoluteUrl(path: string) {
  return new URL(path, env.NEXT_PUBLIC_APP_URL).href;
}
