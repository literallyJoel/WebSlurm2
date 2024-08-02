import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { isSetupComplete } from "@/api/setup";
import { queryClient } from "@/main";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const isSetup = await queryClient.fetchQuery({
      queryKey: ["isSetup"],
      queryFn: isSetupComplete,
    });

    if (!isSetup?.isSetup && !location.pathname.includes("/setup")) {
      throw redirect({
        to: "/setup",
      });
    }
  },
  component: () => (
    <main className="flex min-h-screen flex-col items-center bg-slate-900 text-white">
      <Outlet />
    </main>
  ),
});
