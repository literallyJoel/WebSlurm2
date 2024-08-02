import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/setup/3")({
  component: () => <div>Hello /setup/3!</div>,
});
