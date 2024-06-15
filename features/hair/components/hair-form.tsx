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
import { insertHairSchema } from "@/db/schema";
import { convertAmountToMiliunits } from "@/lib/utils";
import { AmountInput } from "@/components/amount-input";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  colour: z.string(),
  weight: z.string(),
  length: z.string(),
  upc: z.string(),
  price: z.string(),
  isPriceFixed: z.boolean(),
  sellerId: z.string().nullable(),
  orderId: z.string().nullable(),
});

const apiSchema = insertHairSchema.omit({
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
};

export const HairForm = ({
  id,
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
    const length = parseInt(values.length);
    const weight = parseInt(values.weight);
    const price = parseFloat(values.price);
    const priceInMillis = convertAmountToMiliunits(price);
    onSubmit({
      ...values,
      length,
      weight,
      price: priceInMillis,
      weightInStock: weight ? weight : 0,
    });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          name="upc"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>UPC</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="UPC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="colour"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colour</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="Colour" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="length"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Length</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="Length" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="weight"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="Weight" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="price"
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
          name="isPriceFixed"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Is Price Fixed</FormLabel> */}
              <FormControl>
                <div className="items-top flex space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms1"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Is Price Fixed?
                    </label>
                    <p className="text-sm text-muted-foreground">
                      If this is ticked, the price for the line will not be
                      recalculated.
                    </p>
                  </div>
                </div>
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
            Delete hair
          </Button>
        )}
      </form>
    </Form>
  );
};
