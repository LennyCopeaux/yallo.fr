import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackToHomeLink } from "@/components/navigation";
import { ScrollToTop } from "@/components/layout";
import { DemoCallButton } from "@/components/demo/demo-call-button";
import { DemoHeader } from "@/components/demo/demo-header";

export const metadata = {
  title: "Démo gratuite | Yallo",
  description: "Testez gratuitement Yallo en appelant notre numéro de démonstration. Découvrez l'IA vocale en action avec 30 secondes gratuites.",
};

const phoneNumber = "0000000000";
const formattedPhoneNumber = "+33 0 00 00 00 00";

const menuItems = [
  { name: "Menu Classique", price: "8€" },
  { name: "Menu XL", price: "10€" },
  { name: "Formule Duo", price: "15€" },
  { name: "Burger", price: "5€" },
  { name: "Pizza Margherita", price: "9€" },
];

const options = ["Supplément Fromage", "Double Viande", "Sans Oignon", "Bien Cuit"];
const accompagnements = ["Salade", "Potatoes", "Onion Rings", "Coleslaw"];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
        <BackToHomeLink />
        
        <DemoHeader>
          <Card className="mb-12 border-primary/30 bg-primary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Prêt à tester ?</CardTitle>
              <CardDescription>
                Cliquez sur le bouton ci-dessous pour appeler directement
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="text-3xl font-bold text-foreground mb-2">
                {formattedPhoneNumber}
              </div>
              <DemoCallButton phoneNumber={phoneNumber} />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Menu de démonstration</CardTitle>
              <CardDescription>
                Voici le menu disponible pour cette démo. Commandez ce que vous voulez !
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
                  PLATS
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {menuItems.map((item) => (
                    <div
                      key={`menu-${item.name}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border hover:border-primary/30 transition-colors"
                    >
                      <span className="text-foreground font-medium">{item.name}</span>
                      <span className="text-primary font-bold">{item.price}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Options disponibles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <Badge key={`option-${option}`} variant="outline" className="text-sm">
                      {option}
                    </Badge>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Accompagnements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {accompagnements.map((acc) => (
                    <Badge key={`acc-${acc}`} variant="outline" className="text-sm">
                      {acc}
                    </Badge>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
                  BOISSONS & DESSERTS
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-card/30 border border-border">
                    <div className="font-semibold text-foreground mb-1">Sodas</div>
                    <div className="text-sm text-muted-foreground">33cl : 1.50€ / Bouteille 1.5L : 3.50€</div>
                  </div>
                  <div className="p-3 rounded-lg bg-card/30 border border-border">
                    <div className="font-semibold text-foreground mb-1">Tiramisu</div>
                    <div className="text-sm text-muted-foreground">3€</div>
                  </div>
                  <div className="p-3 rounded-lg bg-card/30 border border-border">
                    <div className="font-semibold text-foreground mb-1">Tarte au Daim</div>
                    <div className="text-sm text-muted-foreground">3€</div>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardContent className="py-4 px-4">
              <div className="flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  <strong className="text-foreground">Astuce :</strong> Essayez de commander avec des accents, 
                  des modifications ou des demandes spéciales. L&apos;IA comprend tout !
                </p>
              </div>
            </CardContent>
          </Card>
        </DemoHeader>
      </div>
    </div>
  );
}
