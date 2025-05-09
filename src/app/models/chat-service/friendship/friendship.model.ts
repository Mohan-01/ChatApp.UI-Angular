export interface FriendRequest {
  id: string;
  senderUsername: string;
  senderFirstName: string;
  senderLastName: string;
  senderProfilePicture?: string;
  sentAt: Date;
}

export interface Friend {
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  friendStatus: string;
  userStatus: string;
  lastSeen: Date;
}
