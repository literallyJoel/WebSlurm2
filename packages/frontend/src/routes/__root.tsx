import { createRootRoute, redirect, Outlet } from "@tanstack/react-router";
import { queryClient } from "@/main";
import { isSetupComplete } from "@/api/setup";
import { verifyToken } from "@/api/auth";

import Cookies from "js-cookie";
import appStore from "@/stores/appStore";

const isSetupCompleted = async () => {
  const result = await queryClient.fetchQuery({
    queryKey: ["isSetup"],
    queryFn: isSetupComplete,
  });
  return result?.isSetup;
};

const isAuthenticated = async () => {
  const token = Cookies.get("ws2_token");

  if (!token) return false;

  try {
    const tokenData = await queryClient.fetchQuery({
      queryKey: ["verifyToken"],
      queryFn: () => verifyToken(token),
    });

    appStore.setState((state) => {
      return {
        ...state,
        tokenData,
      };
    });
    return true;
  } catch (e) {
    appStore.setState((state) => {
      return {
        ...state,
        tokenData: null,
      };
    });
    return false;
  }
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
      <Outlet />
    </main>
  ),
});
