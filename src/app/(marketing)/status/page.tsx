"use client";

import { ScrollToTop } from "@/components/scroll-to-top";

export default function StatusPage() {
  const currentDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const services = [
    {
      name: "Téléphonie",
      status: "development",
      label: "En cours de développement",
    },
    {
      name: "IA",
      status: "development",
      label: "En cours de développement",
    },
    {
      name: "Dashboard",
      status: "development",
      label: "En cours de développement",
    },
    {
      name: "Mailing",
      status: "operational",
      label: "Opérationnel",
    },
  ];

  return (
    <>
      <ScrollToTop />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-12 text-center">
          État des services Yallo
        </h1>

        <div className="space-y-4 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-card/30 rounded-lg p-6 border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    service.status === "operational"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-amber-500"
                  }`}
                />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {service.name}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium ${
                    service.status === "operational"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {service.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card/30 rounded-lg p-6 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            Dernière mise à jour : {currentDate}
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Vous rencontrez un problème ?{" "}
            <a
              href="mailto:support@yallo.fr"
              className="text-primary hover:text-primary/80"
            >
              Contactez notre équipe
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

