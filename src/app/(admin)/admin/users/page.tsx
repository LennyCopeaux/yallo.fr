import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { UsersDataTable, AddUserDialog } from "@/components/admin";
import { Suspense } from "react";
import { Loader2, Users } from "lucide-react";

// Récupère tous les utilisateurs
async function getUsers() {
  return await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      mustChangePassword: users.mustChangePassword,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(sql`${users.createdAt} DESC`);
}

export default async function UsersPage() {
  const usersList = await getUsers();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les comptes administrateurs et propriétaires
          </p>
        </div>
        <AddUserDialog />
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <p className="text-2xl font-bold">{usersList.length}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <p className="text-2xl font-bold text-red-400">
            {usersList.filter(u => u.role === "ADMIN").length}
          </p>
          <p className="text-sm text-muted-foreground">Admins</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <p className="text-2xl font-bold text-primary">
            {usersList.filter(u => u.role === "OWNER").length}
          </p>
          <p className="text-sm text-muted-foreground">Owners</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <p className="text-2xl font-bold text-amber-400">
            {usersList.filter(u => u.mustChangePassword).length}
          </p>
          <p className="text-sm text-muted-foreground">En attente</p>
        </div>
      </div>

      {/* DataTable */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }>
        {usersList.length === 0 ? (
          <div className="border border-border rounded-xl bg-card/20 p-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Aucun utilisateur</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Créez votre premier utilisateur pour commencer.
              </p>
            </div>
          </div>
        ) : (
          <UsersDataTable data={usersList} />
        )}
      </Suspense>
    </div>
  );
}

