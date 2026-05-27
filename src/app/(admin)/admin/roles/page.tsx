import { RolesManager } from "@/components/admin/roles-manager";
import { getRoles } from "./actions";

export default async function AdminRolesPage() {
  const roles = await getRoles();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <RolesManager initialRoles={roles} />
    </div>
  );
}
