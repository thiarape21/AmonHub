  import { UsersTable } from "@/components/users/users-table";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CustomButton } from "@/components/ui/custom-button";

enum UserRole {
  ADMIN = "Administrador",
  MEMBER = "Miembro",
  CONSULTANT = "Consultor",
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
}

async function getUsers(): Promise<User[]> {
  const res = await fetch("http://localhost:3030/api/usuarios/", {
    cache: "no-store", // Disable caching to always get fresh data
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Usuarios y roles
            </h1>
            <p className="text-slate-600">Gestión de usuarios y roles</p>
          </div>
          <Link href="/inicio">
            <CustomButton variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </CustomButton>
          </Link>
        </div>
        <UsersTable initialUsers={users} />
      </div>
    </div>
  );
}
