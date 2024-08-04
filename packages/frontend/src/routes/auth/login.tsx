import isAuthenticated from "@/helpers/isAuthenticated";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, useAnimation } from "framer-motion";
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
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/api/auth";
export const Route = createFileRoute("/auth/login")({
  beforeLoad: async () => {
    if (await isAuthenticated()) {
      throw redirect({ to: "/", from: "/auth/login" });
    }
  },
  component: () => Login(),
});

type LoginFormData = {
  email: string;
  password: string;
};
function Login() {
  const navigate = useNavigate();
  const loginRequest = useMutation({
    mutationKey: ["login"],
    mutationFn: (request: LoginFormData) =>
      login(request.email, request.password),
  });

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const controls = useAnimation();

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    loginRequest.mutate(data, {
      onSuccess: () => {
        navigate({ to: "/", from: "/auth/login" });
      },
      onError: () => {
        controls.start("start");
      },
    });
  }

  //todo implement oAuth

  const variants = {
    start: (i: number) => ({
      rotate: i % 2 === 0 ? [-1, 1.3, 0] : [1, -1.4, 0],
    }),
    reset: {
      rotate: 0,
    },
  };

  return (
    <div className="flex flex-grow items-center justify-center w-full flex-col">
      <motion.div
        animate={controls}
        variants={variants}
        transition={{ duration: 0.4, delay: 0 }}
        className="flex w-full flex-row items-center justify-center"
      >
        <Card className="w-5/12 rounded-xl border-none bg-white/70 backdrop-blur-lg">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription
              className={loginRequest.isError ? "text-red-500" : ""}
            >
              {loginRequest.isError
                ? "Invalid email or password."
                : "Login to your account to use WebSlurm"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
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
                        <Input placeholder="john@doe.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

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

                <div className="flex w-full flex-row justify-end py-2">
                  <motion.div whileHover={{ rotate: 360 }}>
                    <Button
                      type="submit"
                      className="group transform rounded-full  transition duration-500 ease-in-out hover:scale-110 hover:bg-fuchsia-600"
                    >
                      <ChevronRightIcon className="size-5 text-white transition-colors" />
                    </Button>
                  </motion.div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
