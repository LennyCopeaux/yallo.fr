import { auth, signOut } from "@/auth";
import { headers } from "next/headers";
import { buildAppUrlServer } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getMenuDataV2 } from "@/features/menu/actions-v2";
import { MenuClientV2 } from "./menu-client-v2";

export default async function MenuPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Si l'utilisateur doit changer son mot de passe, redirige vers /update-password
  if (session.user.mustChangePassword === true) {
    redirect("/update-password");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  // Récupère les données du menu avec la nouvelle structure
  const menuData = await getMenuDataV2();

  if (!menuData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Aucun restaurant trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black gradient-text">Yallo</span>
              <span className="text-muted-foreground text-sm hidden sm:block">/ Menu</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#f6cf62] animate-pulse-dot" />
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {session.user.email}
                </span>
              </div>
              <form
                action={async () => {
                  "use server";
                  const headersList = await headers();
                  const host = headersList.get("host") || "";
                  const loginUrl = buildAppUrlServer("/login", host);
                  await signOut({ redirectTo: loginUrl });
                }}
              >
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-white/5">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Déconnexion</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MenuClientV2 menuData={menuData} />
      </main>
    </div>
  );
}

