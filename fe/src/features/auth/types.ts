export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  password: string;
}

export interface ResponseUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface PublicUser {
  email: string;
  full_name: string;
}

export interface AuthTokenResponse {
  access_token: string;
  type: string;
}
