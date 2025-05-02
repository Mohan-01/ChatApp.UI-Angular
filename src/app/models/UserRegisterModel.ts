export interface UserRegisterModel {
  Username: string;

  Email: string;

  Password: string;
}

export const initialize_user_registration: UserRegisterModel = {
  Username: '',

  Email: '',

  Password: '',
};
