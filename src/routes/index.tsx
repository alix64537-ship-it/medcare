import { createFileRoute } from "@tanstack/react-router";

import { MedCareApp } from "@/components/medcare/MedCareApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedCare — цифровая клиника: запись к врачу и AI-триаж" },
      { name: "description", content: "Запись к врачам, электронная медкарта, AI-триаж симптомов и медкалькуляторы в цифровой клинике MedCare." },
      { property: "og:title", content: "MedCare — цифровая клиника" },
      { property: "og:description", content: "AI-триаж симптомов, запись к специалистам с QR-талоном и медкарта с заключениями врачей." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MedCareApp,
});
