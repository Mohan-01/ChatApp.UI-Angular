export interface SendFriendRequest {
  RecipientUsername: string;
}

export interface AcceptFriendRequest {
  RequesterUsername: string;
}

export interface BlockUser {
  BlockedUsername: string;
}

export interface UnfriendUserRequest {
  friendUsername: string;
}

export const InitializeSendFriendRequest: SendFriendRequest = {
  RecipientUsername: '',
};

export const InitializeAcceptFriendRequest: AcceptFriendRequest = {
  RequesterUsername: '',
};

export const InitializeBlockUser: BlockUser = {
  BlockedUsername: '',
};

export const InitializeUnfriendUserRequest: UnfriendUserRequest = {
  friendUsername: '',
};
