import setupStore from "@/stores/setupStore";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
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
import { ChevronRight } from "lucide-react";
export const Route = createLazyFileRoute("/setup/")({
  component: EmailNameInput,
});

function EmailNameInput() {
  const navigate = useNavigate({ from: "/setup" });
  const user = useStore(setupStore, (state) => state["user"]);

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: user,
  });

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    console.log("submit");
    setupStore.setState((state) => {
      return {
        ...state,
        user: {
          ...state.user,
          ...data,
        },
      };
    });
    navigate({
      to: "/setup/2",
    });
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="flex w-1/2 flex-row items-center justify-center p-2 text-4xl font-bold">
        Web<span className="text-fuchsia-600">Slurm</span>
      </div>
      <motion.div
        key="emailName"
        layoutId="setup"
        initial={{ opacity: 0, x: -1000 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 1000 }}
        transition={{ type: "spring", duration: 0.45, bounce: 0.4 }}
        className="flex w-1/2 flex-row items-center justify-center p-2"
      >
        <Card className="w-full rounded-xl border-none bg-white/70 backdrop-blur-lg">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Create a local account to get started. Third party login can be
              enabled later.
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex w-full flex-row items-center justify-between">
                        <FormLabel>Name</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex w-full flex-row items-center justify-between">
                        <FormLabel>Email</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input placeholder="John@Doe.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="w-full flex flex-row items-end justify-end p-2">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.1, rotate: 360 }}
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
