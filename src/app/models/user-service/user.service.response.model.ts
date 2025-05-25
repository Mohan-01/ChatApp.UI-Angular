export interface UserServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
}
