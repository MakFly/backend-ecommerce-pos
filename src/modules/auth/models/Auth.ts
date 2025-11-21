export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: RoleName;
  description?: string;
  permissions: Permission[];
}

export type RoleName = 'ADMIN' | 'STAFF' | 'POS_OPERATOR' | 'CUSTOMER';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: PermissionAction;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}
