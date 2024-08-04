import { createInitial } from "@/api/setup";
import setupStore from "@/stores/setupStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { useForm } from "react-hook-form";
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
export const Route = createFileRoute("/setup/3")({
  loader: () => {
    const _user = setupStore.state.user;
    if (!_user.email || !_user.password || !_user.name) {
      throw redirect({
        from: "/setup/3",
        to: "/setup/2",
        replace: true,
      });
    }
  },
  component: () => OrganisationInput(),
});

function OrganisationInput() {
  const user = useStore(setupStore, (state) => state["user"]);
  const create = useMutation({
    mutationKey: ["createInitial"],
    mutationFn: createInitial,
  });
  const navigate = useNavigate();

  const formSchema = z.object({
    organisationName: z.string().min(1, "Organisation name is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organisationName: user.organisationName ?? "",
    },
  });

  async function handleSumbit(data: z.infer<typeof formSchema>) {
    setupStore.setState((state) => {
      return {
        ...state,
        user: {
          ...state.user,
          organisationName: data.organisationName,
        },
      };
    });

    //We update the state above just in case it's needed, but it doesn't update immediately, so we pass it in here manually too.
    create.mutate(
      { ...user, organisationName: data.organisationName },
      {
        onSuccess: () => {
          //Clear the password from the state so we don't store it any longer than we need to
          setupStore.setState((state) => {
            return {
              ...state,
              user: {
                ...state.user,
                password: "",
              },
            };
          });
          navigate({
            from: "/setup/3",
            to: "/setup/4",
          });
        },
        onError: (error) => {
          console.error(error);
          toast.error(
            "There was an issue creating your account. Please try again later.",
            {
              theme: "colored",
              draggable: true,
              autoClose: 5000,
              transition: Bounce,
            }
          );
        },
      }
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <ToastContainer />
      <div className="flex w-1/2 flex-row items-center justify-center p-2 text-4xl font-bold">
        Web<span className="text-fuchsia-600">Slurm</span>
      </div>

      <motion.div
        key="organisation"
        layoutId="setup"
        initial={{ opacity: 0, x: -1000 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 1000 }}
        transition={{ type: "spring", duration: 0.45, bounce: 0.4 }}
        className="flex  w-1/2  flex-row items-center justify-center  p-2"
      >
        <Card className="w-full rounded-xl border-none bg-white/70 backdrop-blur-lg">
          <CardHeader>
            <CardTitle>Create an Organisation</CardTitle>
            <CardDescription>
              You'll be the admin of this organisation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSumbit)}
                className="space-y-2"
              >
                <FormField
                  control={form.control}
                  name="organisationName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex w-full flex-row items-center justify-between">
                        <FormLabel>Organisation Name</FormLabel>
                        <FormMessage />
                      </div>

                      <FormControl>
                        <Input
                          placeholder="Apterture Laboratories"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex w-full flex-row items-center justify-end">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    className="bg-slate-800 rounded-full p-2"
                    onClick={() => navigate({ to: "/setup/4" })}
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
