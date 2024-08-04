import { createRootRoute, redirect, Outlet } from "@tanstack/react-router";
import { queryClient } from "@/main";
import { isSetupComplete } from "@/api/setup";
import isAuthenticated from "@/helpers/isAuthenticated";
import { Link } from "@tanstack/react-router";
import appStore from "@/stores/appStore";
import defaultAvatar from "@/assets/image/profile/default.jpg";
const isSetupCompleted = async () => {
  const result = await queryClient.fetchQuery({
    queryKey: ["isSetup"],
    queryFn: isSetupComplete,
  });
  return result?.isSetup;
};

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const setupCompleted = await isSetupCompleted();

    if (!setupCompleted) {
      if (!location.pathname.includes("/setup")) {
        throw redirect({ to: "/setup" });
      }
    } else if (
      !location.pathname.includes("/auth") &&
      !location.pathname.includes("/setup")
    ) {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        throw redirect({ to: "/auth/login" });
      }
    }
  },
  component: () => (
    <main className="flex min-h-screen flex-col items-center bg-slate-900 text-white">
      {!location.pathname.includes("/setup") && (
        <div className="w-full flex flex-row py-4 px-12 justify-between">
          <Link
            className="text-2xl font-bold"
            to={location.pathname.includes("/auth") ? "" : "/"}
          >
            Web<span className="text-fuchsia-600">Slurm</span>
          </Link>

          {appStore.state.tokenData && (
            <img
              src={appStore.state.tokenData.image ?? defaultAvatar}
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
          )}
        </div>
      )}
      <Outlet />
    </main>
  ),
});
