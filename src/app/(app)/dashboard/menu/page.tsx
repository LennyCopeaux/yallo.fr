import { auth, signOut } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { buildAppUrlServer } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
import { getMenuData } from "@/features/menu/actions";
import { MenuManager } from "@/components/menu";
import { ModeToggle } from "@/components/navigation";
import Link from "next/link";

export default async function MenuPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.mustChangePassword === true) {
    redirect("/update-password");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const menuData = await getMenuData();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black gradient-text">Yallo</span>
              <span className="text-muted-foreground text-sm hidden sm:block">/ Menu</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {session.user.email}
                </span>
              </div>
              <ModeToggle />
              <form
                action={async () => {
                  "use server";
                  const headersList = await headers();
                  const host = headersList.get("host") || "";
                  const loginUrl = buildAppUrlServer("/login", host);
                  await signOut({ redirectTo: loginUrl });
                }}
              >
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Déconnexion</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gestion du Menu</h1>
          <p className="text-muted-foreground mt-2">
            Importez votre menu via photo ou modifiez-le manuellement en JSON.
          </p>
        </div>

        <MenuManager initialMenuData={menuData} />
      </main>
    </div>
  );
}
