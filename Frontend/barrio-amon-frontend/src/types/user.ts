export enum UserRole {
  ADMIN = 1,
  MEMBER = 2,
  CONSULTANT = 3,
}

export const RoleNames: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.MEMBER]: "Miembro",
  [UserRole.CONSULTANT]: "Consultor",
};

export interface User {
  id: string;
  full_name: string;
  email: string;
  role_id: UserRole;
} 