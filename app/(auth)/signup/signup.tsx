"use client";

import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DiscordLogoIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";
import { SubmitButton } from "@/components/submit-button";
import { useSignup } from "@/features/auth/api/use-signup";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
});

type FormValues = z.input<typeof formSchema>;

export function Signup() {
  const signupMutation = useSignup();

  const defaultValues = {
    email: "",
    password: "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
    signupMutation.mutate(values, {
      onSuccess: () => {
        location.replace("/");
      },
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{APP_TITLE} Sign Up</CardTitle>
        <CardDescription>Sign up to start using the app</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login/discord">
            <DiscordLogoIcon className="mr-2 h-5 w-5" />
            Sign up with Discord
          </Link>
        </Button>
        <div className="my-2 flex items-center">
          <div className="flex-grow border-t border-muted" />
          <div className="mx-2 text-muted-foreground">or</div>
          <div className="flex-grow border-t border-muted" />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4"
          >
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-2">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={false}
                        placeholder="email@example.com"
                        autoComplete="email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                </div>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-2">
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        disabled={false}
                        placeholder="********"
                        autoComplete="current-password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                </div>
              )}
            />

            {/* {state?.fieldError ? (
            <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {Object.values(state.fieldError).map((err) => (
                <li className="ml-4" key={err}>
                  {err}
                </li>
              ))}
            </ul>
          ) : state?.formError ? (
            <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {state?.formError}
            </p>
          ) : null} */}
            <div>
              <Link href={"/login"}>
                <span className="p-0 text-xs font-medium underline-offset-4 hover:underline">
                  Already signed up? Login instead.
                </span>
              </Link>
            </div>

            <SubmitButton className="w-full"> Sign Up</SubmitButton>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Cancel</Link>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
