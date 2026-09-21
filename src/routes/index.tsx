import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { App } from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lyric Studio — Music & Translation Workspace" },
      {
        name: "description",
        content: "A focused workspace for timing, translating, previewing, and exporting song lyrics.",
      },
      { property: "og:title", content: "Lyric Studio" },
      {
        property: "og:description",
        content: "Time, translate, preview, and export lyrics in one focused workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
      <App />
    </ClientOnly>
  );
}
