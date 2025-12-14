"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { submitContactForm } from "@/app/(marketing)/contact/actions";
import { ScrollToTop } from "@/components/scroll-to-top";
import { BackToHomeLink } from "@/components/back-to-home-link";

const contactFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().refine(
    (val) => ["installation", "rdv-expert", "plan-commission", "plan-fixe", "support", "autre"].includes(val),
    { message: "Veuillez sélectionner un sujet" }
  ),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const subjectOptions = [
  { value: "installation", label: "Installation" },
  { value: "rdv-expert", label: "Parler à un expert" },
  { value: "plan-commission", label: "Plan Commission (5%)" },
  { value: "plan-fixe", label: "Plan Abonnement (299€/mois)" },
  { value: "support", label: "Support Technique" },
  { value: "autre", label: "Autre demande" },
];

function mapUrlSubjectToValue(subject: string | null): string | undefined {
  const mapping: Record<string, string> = {
    "support": "support",
    "autre": "autre",
    "installation": "installation",
    "rdv-expert": "rdv-expert",
    "plan-commission": "plan-commission",
    "plan-fixe": "plan-fixe",
  };
  return subject ? mapping[subject] : undefined;
}

function getDefaultMessage(subject: string | null): string {
  const messages: Record<string, string> = {
    "installation": "Bonjour,\n\nJe souhaite installer Yallo pour mon restaurant et obtenir un accès à la plateforme.\n\nMerci de me recontacter pour discuter des modalités d'installation.\n\nCordialement,",
    "rdv-expert": "Bonjour,\n\nJe souhaite prendre rendez-vous avec un expert pour discuter de la solution Yallo pour mon restaurant.\n\nMerci de me proposer des créneaux disponibles.\n\nCordialement,",
    "plan-commission": "Bonjour,\n\nJe suis intéressé par le Plan Commission (5% par commande).\n\nPourriez-vous me fournir plus d'informations sur cette formule ?\n\nCordialement,",
    "plan-fixe": "Bonjour,\n\nJe suis intéressé par le Plan Abonnement (299€/mois).\n\nPourriez-vous me fournir plus d'informations sur cette formule ?\n\nCordialement,",
    "support": "Bonjour,\n\nJ'ai besoin d'aide concernant...\n\nMerci de votre retour.\n\nCordialement,",
  };
  return messages[subject || ""] || "";
}

function ContactFormInner() {
  const searchParams = useSearchParams();
  const urlSubject = searchParams.get("subject");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      subject: mapUrlSubjectToValue(urlSubject) || undefined,
      message: getDefaultMessage(urlSubject) || "",
    },
  });

  const selectedSubject = watch("subject");

  useEffect(() => {
    const mappedSubject = mapUrlSubjectToValue(urlSubject);
    if (mappedSubject) {
      setValue("subject", mappedSubject);
    }
    const defaultMsg = getDefaultMessage(urlSubject);
    if (defaultMsg) {
      setValue("message", defaultMsg);
    }
  }, [urlSubject, setValue]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitContactForm(data);
      if (result.success) {
        toast.success("Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.");
        setValue("name", "");
        setValue("email", "");
        setValue("subject", undefined as unknown as string);
        setValue("message", "");
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch {
      toast.error("Une erreur est survenue lors de l'envoi du message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ScrollToTop />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 w-full">
        <div className="max-w-2xl mx-auto">
          <BackToHomeLink />
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-foreground">
                Contactez-nous
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Une question ? Une demande ? Nous sommes là pour vous aider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className="bg-background/50 border-border"
                    placeholder="Votre nom"
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="bg-background/50 border-border"
                    placeholder="votre@email.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground">
                    Sujet <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedSubject || ""}
                    onValueChange={(value) => setValue("subject", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full bg-background/50 border-border">
                      <SelectValue placeholder="Sélectionnez un sujet" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-sm text-red-500">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    className="bg-background/50 border-border min-h-[150px]"
                    placeholder="Votre message..."
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-black hover:bg-primary/90 font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function ContactFormFallback() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 w-full">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground">
              Contactez-nous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ContactForm() {
  return (
    <Suspense fallback={<ContactFormFallback />}>
      <ContactFormInner />
    </Suspense>
  );
}
