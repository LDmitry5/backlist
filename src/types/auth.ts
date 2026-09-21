export type UserRole = 'user';

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  data: {
    token: string;
    expires_at: string;
    user: AuthUser;
  };
}