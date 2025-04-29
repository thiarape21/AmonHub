"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { UserForm } from "./user-form";
import { useState } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Map role IDs to their names as per database
enum UserRole {
  ADMIN = 1,
  MEMBER = 2,
  CONSULTANT = 3,
}

const RoleNames: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.MEMBER]: "Miembro",
  [UserRole.CONSULTANT]: "Consultor",
};

interface User {
  id: string;
  full_name: string;
  email: string;
  role_id: number;
}

interface UsersTableProps {
  initialUsers: User[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const router = useRouter();

  const handleAddUser = (data: Omit<User, "id">) => {};

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3030/api/usuarios/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      // Here you might want to show an error message to the user
    }
  };

  const handleRoleChange = async (userId: string, newRoleID: number) => {
    try {
      const res = await fetch(`http://localhost:3030/api/usuarios/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role_id: newRoleID }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user role");
      }

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role_id: newRoleID } : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      // Here you might want to show an error message to the user
    }
  };

  console.log(users);
  return (
    <div className="rounded-md border" style={{ backgroundColor: "#e6d9bd" }}>
      <div className="overflow-hidden rounded-md mx-6 my-6">
        <Table>
          <TableHeader style={{ backgroundColor: "#4A6670" }}>
            <TableRow>
              <TableHead className="text-white font-medium h-12 w-1/3">
                Nombre
              </TableHead>
              <TableHead className="text-white font-medium h-12 w-1/3">
                Correo
              </TableHead>
              <TableHead className="text-white font-medium h-12 w-1/4">
                Rol
              </TableHead>
              <TableHead className="text-white font-medium h-12 w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow
                key={user.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#e2e8f0" : "#f1f5f9",
                }}
              >
                <TableCell className="p-4">{user.full_name}</TableCell>
                <TableCell className="p-4">{user.email}</TableCell>
                <TableCell className="p-4">
                  <Select
                    defaultValue={user.role_id.toString()}
                    onValueChange={(value) =>
                      handleRoleChange(user.id, parseInt(value) as UserRole)
                    }
                  >
                    <SelectTrigger className="w-[180px] bg-white border-gray-300">
                      <SelectValue>
                        {RoleNames[user.role_id as UserRole]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RoleNames).map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-4">
                  <CustomButton
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </CustomButton>
                </TableCell>
              </TableRow>
            ))}
            {/* Empty rows to match the design */}
            {Array.from({ length: Math.max(0, 5 - users.length) }).map(
              (_, index) => (
                <TableRow
                  key={`empty-${index}`}
                  style={{
                    backgroundColor:
                      (users.length + index) % 2 === 0 ? "#e2e8f0" : "#f1f5f9",
                  }}
                >
                  <TableCell className="p-4">&nbsp;</TableCell>
                  <TableCell className="p-4">&nbsp;</TableCell>
                  <TableCell className="p-4">&nbsp;</TableCell>
                  <TableCell className="p-4">&nbsp;</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 flex justify-end space-x-2 mr-6 mb-4">
        <Link href="/register?from=usuarios">
          <CustomButton variant="outline">Agregar</CustomButton>
        </Link>
        <CustomButton>Guardar</CustomButton>
      </div>
    </div>
  );
}
