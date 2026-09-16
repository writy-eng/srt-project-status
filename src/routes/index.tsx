import { createFileRoute } from "@tanstack/react-router";
import { MagazinePage } from "@/components/magazine-page";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <MagazinePage />;
}
