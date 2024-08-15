import { createLazyFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import appStore from "@/stores/appStore";
export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const tokenData = useStore(appStore, (state) => state.tokenData);
  return (
    <div className="p-2">
      <span className="font-bold text-3xl">
        Welcome,
        <span className="text-fuchsia-600">
          {tokenData?.name ? ` ${tokenData.name.split(" ")[0]}.` : ""}
        </span>
      </span>
    </div>
  );
}
