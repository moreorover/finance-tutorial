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
import { insertHairSchema, insertHairTransactionSchema } from "@/db/schema";
import { AmountInput } from "@/components/amount-input";
import { HairSelect } from "@/features/hair/components/hair-select";

const formSchema = z.object({
  parentHairId: z.string(),
  weight: z.string(),
  price: z.string(),
  orderId: z.string(),
});

const apiSchema = insertHairTransactionSchema.omit({
  id: true,
});

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

type Hair = z.infer<typeof insertHairSchema>;

type Props = {
  id?: string;
  hair: Hair[];
  defaultValues?: FormValues;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const HairTransactionForm = ({
  id,
  hair,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
    const weight = parseInt(values.weight);
    const price = parseInt(values.price);
    onSubmit({
      ...values,
      weight,
      price,
    });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  const setMax = (value: { parentHairId: string }) => {
    return hair
      .filter((h) => h.id == value.parentHairId)
      .map((h) => h.weightInStock)[0];
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          name="parentHairId"
          control={form.control}
          render={({ field }) => (
            <HairSelect {...field} hair={hair} disabled={disabled} />
          )}
        />
        <FormField
          name="weight"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight in grams</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={disabled}
                  placeholder="Weight"
                  max={setMax(form.getValues())}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="price"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
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
        <Button className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create hair"}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="mr-2 size-4" />
            Delete hair transaction
          </Button>
        )}
      </form>
    </Form>
  );
};
