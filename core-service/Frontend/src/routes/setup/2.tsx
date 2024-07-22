import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import setupStore from "@/stores/setupStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/setup/2")({
  loader: () => {
    const user = setupStore.state.user;
    if (user.name === "" || user.email === "") {
      throw redirect({
        to: "/setup",
      });
    }
  },
  component: () => PasswordInput(),
});

function PasswordInput() {
  const formSchema = z
    .object({
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" }),
      confirmPassword: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        //Contains an uppercase character
        .regex(/[A-Z]/, {
          message:
            "Password must contain at least one upper case character, one lower case character, one number, and one special character.",
        })
        //Contains a lowercase character
        .regex(/[a-z]/, {
          message:
            "Password must contain at least one upper case character, one lower case character, one number, and one special character.",
        })
        //contains a number
        .regex(/\d/, {
          message:
            "Password must contain at least one upper case character, one lower case character, one number, and one special character.",
        })
        //contains a special character
        .regex(/\W/, {
          message:
            "Password must contain at least one upper case character, one lower case character, one number, and one special character.",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    setupStore.setState((state) => {
      return {
        ...state,
        user: {
          ...state.user,
          password: data.password,
        },
      };
    });

    router.navigate({
      to: "/setup/3",
    });
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="flex w-1/2 flex-row items-center justify-center p-2 text-4xl font-bold">
        Web<span className="text-fuchsia-600">Slurm</span>
      </div>
      <motion.div
        key="password"
        layoutId="setup"
        initial={{ opacity: 0, x: -1000 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 1000 }}
        transition={{ type: "spring", duration: 0.45, bounce: 0.4 }}
        className="flex  w-1/2  flex-row items-center justify-center  p-2"
      >
        <Card className="w-full rounded-xl border-none bg-white/70 backdrop-blur-lg">
          <CardHeader>
            <CardTitle>Choose your password</CardTitle>
            <CardDescription>
              Make sure it's at least 8 characters long.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-2"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex w-full flex-row items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <FormMessage />
                      </div>

                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex w-full flex-row items-center justify-between">
                        <FormLabel>Confirm Password</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex w-full flex-row justify-between py-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="bg-slate-800 rounded-full p-2"
                    onClick={() => router.navigate({ to: "/setup" })}
                  >
                    <ChevronLeft className="text-white" />
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.1 }}
                    className="bg-slate-800 rounded-full p-2"
                  >
                    <ChevronRight className="text-white" />
                  </motion.button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
