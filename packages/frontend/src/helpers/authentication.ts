import { verifyToken } from "@/api/auth";
import { queryClient, router } from "@/main";
import Cookies from "js-cookie";
import appStore from "@/stores/appStore";
import { Navigate } from "@tanstack/react-router";
export const isAuthenticated = async () => {
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

export const signOut = async () => {
  appStore.setState((state) => {
    return {
      ...state,
      tokenData: null,
    };
  });

  Cookies.remove("ws2_token");
  router.navigate({ to: "/auth/login" });
};
