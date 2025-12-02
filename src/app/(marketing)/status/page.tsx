"use client";

import { useEffect } from "react";

export default function StatusPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const services = [
    {
      name: "Téléphonie (Twilio)",
      status: "operational",
      label: "Opérationnel",
    },
    {
      name: "Intelligence Artificielle",
      status: "operational",
      label: "Opérationnel",
    },
    {
      name: "Dashboard Cuisine",
      status: "operational",
      label: "Opérationnel",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-12 text-center">
          État des services Yallo
        </h1>

        <div className="space-y-4 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-card/30 rounded-lg p-6 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {service.name}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-medium">
                  {service.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card/30 rounded-lg p-6 border border-white/10 text-center">
          <p className="text-sm text-muted-foreground">
            Dernière mise à jour : {currentDate}
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Vous rencontrez un problème ?{" "}
            <a
              href="mailto:support@yallo.fr"
              className="text-[#f6cf62] hover:text-[#f6cf62]/80"
            >
              Contactez notre équipe
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

