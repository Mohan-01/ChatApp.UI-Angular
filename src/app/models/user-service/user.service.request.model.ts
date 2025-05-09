export interface UpdateUserRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  status?: string;
}

export interface SearchUsersRequest {
  searchTerm: string;
}

export const InitializeUpdateUserRequest: UpdateUserRequest = {
  firstName: undefined,
  middleName: undefined,
  lastName: undefined,
  email: undefined,
  phone: undefined,
  profilePicture: undefined,
  status: undefined,
};

export const InitializeSearchUserRequest: SearchUsersRequest = {
  searchTerm: '',
};
