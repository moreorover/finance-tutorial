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
import { insertHairSchema } from "@/db/schema";

const formSchema = z.object({
  colour: z.string(),
  weight: z.string(),
  length: z.string(),
  upc: z.string(),
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
    onSubmit({
      ...values,
      length,
      weight,
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
            <Trash className="mr-2 size-4" />
            Delete order
          </Button>
        )}
      </form>
    </Form>
  );
};
