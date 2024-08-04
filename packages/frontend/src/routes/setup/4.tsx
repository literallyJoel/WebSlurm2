import { markSetupComplete } from "@/api/setup";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProviderButton } from "@/components/ui/providerButton";
import setupStore from "@/stores/setupStore";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { motion } from "framer-motion";
import googleLogo from "@/assets/image/authproviders/google.png";
import { useState } from "react";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/setup/4")({
  // loader: async () => {
  //   const _user = setupStore.state.user;
  //   if (!_user.email || !_user.name || !_user.organisationName) {
  //     throw redirect({
  //       from: "/setup/4",
  //       to: "/setup/3",
  //       replace: true,
  //     });
  //   }
  // },
  component: () => SelectProviders(),
});

function SelectProviders() {
  //todo: add dynamic providers
  const [providers, setProviders] = useState<string[]>([]);
  const navigate = useNavigate();
  const completeSetup = useMutation({
    mutationKey: ["completeSetup"],
    mutationFn: markSetupComplete,
  });

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="flex w-1/2 flex-row items-center justify-center p-2 text-4xl font-bold">
        Web<span className="text-fuchsia-600">Slurm</span>
      </div>
      <motion.div
        key="enableProviders"
        layoutId="setup"
        initial={{ opacity: 0, x: -1000 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 1000 }}
        transition={{ type: "spring", duration: 0.45, bounce: 0.4 }}
        className="flex  w-1/2  flex-row items-center justify-center  p-2"
      >
        <Card className="w-full rounded-xl border-none bg-white/70 backdrop-blur-lg">
          <CardHeader>
            <CardTitle>Do you want to enable third party login?</CardTitle>
            <CardDescription>
              This is recommended, but requires some additional setup. You can
              enable more than one now, and change them later.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 p-4">
            <ProviderButton
              name="Google"
              img={googleLogo}
              toggleProvider={() =>
                providers.includes("Google")
                  ? setProviders([])
                  : setProviders(["Google"])
              }
              providers={providers}
            />
          </CardContent>

          <CardFooter className="flex flex-row justify-end">
            <Button
              onClick={() => {
                if (providers.length === 0) {
                  completeSetup.mutate(undefined, {
                    onSuccess: () => navigate({ from: "/setup/4", to: "/" }),
                  });
                } else {
                  setupStore.setState((state) => {
                    return {
                      ...state,
                      providerInfo: providers.map((provider) => ({
                        name: provider,
                      })),
                    };
                  });
                  navigate({ from: "/setup/4", to: "/setup/5" });
                }
              }}
            >
              {providers.length === 0
                ? "Continue with Local Only"
                : "Setup Providers"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
