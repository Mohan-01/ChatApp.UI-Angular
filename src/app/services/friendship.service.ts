import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceResponse } from '../models/chat-service/friendship/friendship.response.model';
import {
  Friend,
  FriendRequest,
} from '../models/chat-service/friendship/friendship.model';
import { UserDto } from '../models/user-service/user.service.model';

@Injectable({
  providedIn: 'root',
})
export class FriendshipService {
  private chatApiUrl = `${environment.chatApiUrl}/Friendship`;

  constructor(private http: HttpClient) {}

  // Search for users based on search term
  searchUsers(searchTerm: string): Observable<ServiceResponse<UserDto[]>> {
    return this.http.get<ServiceResponse<UserDto[]>>(
      `${this.chatApiUrl}/searchUsers?searchTerm=${searchTerm}`,
      { withCredentials: true }
    );
  }

  // Get the list of friends for a given user
  getFriendsList(userId: string): Observable<ServiceResponse<Friend[]>> {
    return this.http.get<ServiceResponse<Friend[]>>(
      `${this.chatApiUrl}/getFriendsList/${userId}`,
      { withCredentials: true }
    );
  }

  // Send a friend request to a user
  sendFriendRequest(
    currentUsername: string,
    targetUsername: string
  ): Observable<ServiceResponse<string>> {
    return this.http.post<ServiceResponse<string>>(
      `${this.chatApiUrl}/sendFriendRequest`,
      { currentUsername, targetUsername },
      { withCredentials: true }
    );
  }

  // Accept a friend request from a user
  acceptFriendRequest(
    requesterUsername: string,
    username: string
  ): Observable<ServiceResponse<string>> {
    console.log({ requesterUsername, username });
    return this.http.post<ServiceResponse<string>>(
      `${this.chatApiUrl}/acceptFriendRequest`,
      { requesterUsername, username },
      { withCredentials: true }
    );
  }

  // Block a user
  blockUser(
    userId: string,
    targetUserId: string
  ): Observable<ServiceResponse<string>> {
    return this.http.post<ServiceResponse<string>>(
      `${this.chatApiUrl}/blockUser`,
      { userId, targetUserId },
      { withCredentials: true }
    );
  }

  // Unfriend a user
  unfriendUser(
    userId: string,
    targetId: string
  ): Observable<ServiceResponse<string>> {
    return this.http.post<ServiceResponse<string>>(
      `${this.chatApiUrl}/unfriendUser`,
      { userId, targetId },
      { withCredentials: true }
    );
  }

  // Reject a friend request (if needed)
  rejectFriendRequest(
    requesterUsername: string
  ): Observable<ServiceResponse<string>> {
    return this.http.post<ServiceResponse<string>>(
      `${this.chatApiUrl}/rejectFriendRequest`,
      { requesterUsername },
      { withCredentials: true }
    );
  }

  // Unblock a user
  unblockUser(
    currentUsername: string,
    targetUsername: string
  ): Observable<ServiceResponse<string>> {
    return this.http.post<ServiceResponse<string>>(
      `${this.chatApiUrl}/unblockUser`,
      { currentUsername, targetUsername },
      { withCredentials: true }
    );
  }

  getFriendRequests(
    username: string
  ): Observable<ServiceResponse<FriendRequest[]>> {
    return this.http.get<ServiceResponse<FriendRequest[]>>(
      `${this.chatApiUrl}/getFriendRequests/${username}`,
      { withCredentials: true }
    );
  }
}
