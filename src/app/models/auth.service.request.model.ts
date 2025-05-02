export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangeUsernameRequest {
  newUsername: string;
}

export interface UpdateEmailRequest {
  newEmail: string;
}

export interface ChangePaswordRequest {
  newPassword: string;
}

export interface ForgotUsernameRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export const InitializeRegisterRequest: RegisterRequest = {
  username: '',
  email: '',
  password: '',
};

export const InitializeLoginRequest: LoginRequest = {
  username: '',
  password: '',
};

export const InitializeChangeUsernameRequest: ChangeUsernameRequest = {
  newUsername: '',
};

export const InitializeUpdateEmailRequest: UpdateEmailRequest = {
  newEmail: '',
};

export const InitializeChangePaswordRequest: ChangePaswordRequest = {
  newPassword: '',
};

export const InitializeForgotUsernameRequest: ForgotUsernameRequest = {
  email: '',
};

export const InitializeForgotPasswordRequest: ForgotPasswordRequest = {
  email: '',
};

export const InitializeResetPasswordRequest: ResetPasswordRequest = {
  resetToken: '',
  newPassword: '',
};
