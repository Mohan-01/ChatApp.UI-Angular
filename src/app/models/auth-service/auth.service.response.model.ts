export interface AuthServiceResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface AuthResponse {
  username: string;
  email: string;
  roles: string[];
}
