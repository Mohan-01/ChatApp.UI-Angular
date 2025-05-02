export interface User {
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  status: string;
  email?: string;
  phone?: string;
  lastSeen?: Date;
  isActive?: boolean;
  isOnline?: boolean;
  isFriend: boolean; // This will track if the user is a friend
  isBlocked: boolean; // This will track if the user is blocked
  hasSentRequest: boolean; // This will track if the current user has sent a friend request
  hasReceivedRequest: boolean; // This will track if the current user has received a friend request
}

export interface UserResponse {
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  status: string;
  lastSeen: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  status?: string;
}
