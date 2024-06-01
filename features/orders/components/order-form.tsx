import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import React from "react";
import { Option } from "@/components/multiple-selector";
import { AmountInput } from "@/components/amount-input";
import CurrencyInput from "react-currency-input-field";
import { SingleSelect } from "@/components/single-select";
import { DatePicker } from "@/components/date-picker";
import { convertAmountToMiliunits } from "@/lib/utils";
import { insertOrderSchema } from "@/db/schema";

const formSchema = z.object({
  title: z.string(),
  total: z.string(),
  currency: z.string(),
  placedAt: z.coerce.date(),
  receivedAt: z.coerce.date().nullable(),
  accountId: z.string().nullable(),
});

const apiSchema = insertOrderSchema.omit({
  id: true,
});

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  accountOptions: Option[];
};

export const OrderForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  accountOptions,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
    const total = parseFloat(values.total);
    console.log({ total });
    const amountInMiliunits =
      total > 0
        ? convertAmountToMiliunits(total) * -1
        : convertAmountToMiliunits(total);

    onSubmit({
      ...values,
      total: amountInMiliunits,
    });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  const currencyOptions: { value: string; label: string }[] = [
    { value: "GBP", label: "GBP" },
    { value: "EUR", label: "EUR" },
    { value: "USD", label: "USD" },
    { value: "RUB", label: "RUB" },
  ];

  const defaultCurrencyOption = { value: "GBP", label: "GBP" };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="accountId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <FormControl>
                <SingleSelect
                  placeholder="Select an account"
                  options={accountOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="total"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput
                  {...field}
                  disabled={disabled}
                  placeholder="0.00"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="currency"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <SingleSelect
                  placeholder="Select transaction currency"
                  options={currencyOptions}
                  defaultOption={defaultCurrencyOption}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="placedAt"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placed At</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create account"}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="size-4 mr-2" />
            Delete order
          </Button>
        )}
      </form>
    </Form>
  );
};
