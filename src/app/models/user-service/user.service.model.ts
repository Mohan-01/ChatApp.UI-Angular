export interface UserDto {
  username: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  status?: string;
  lastSeen: Date;
}

export interface SearchUserDto {
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  status: string;
  lastSeen: Date;
}

export enum UserStatus {
  Online,
  Offline,
  Typing,
}

export enum UserRole {
  Admin,
  Member,
}

export const InitializeUserDto: UserDto = {
  username: '',
  firstName: undefined,
  middleName: undefined,
  lastName: undefined,
  email: undefined,
  phone: undefined,
  profilePicture: undefined,
  status: undefined,
  lastSeen: new Date(Date.UTC(1900, 1, 1)),
};

export const InitializeSearchUserDto: SearchUserDto = {
  username: '',
  firstName: '',
  lastName: '',
  profilePicture: '',
  status: '',
  lastSeen: new Date(Date.UTC(1900, 1, 1)),
};
