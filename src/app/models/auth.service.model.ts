export interface AuthUser {
  username: string;
  email: string;
  roles: string[];
}

export const InitializeAuthUser = {
  username: '',
  email: '',
  roles: [],
};
