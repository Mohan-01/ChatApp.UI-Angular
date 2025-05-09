import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Friend } from '../../models/chat-service/friendship/friendship.model';
import { ServiceResponse } from '../../models/chat-service/friendship/friendship.response.model';

import { FriendshipService } from '../../services/friendship.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-search-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.css'],
})
export class SearchUsersComponent implements OnInit {
  @Input() isSearchActive = false;

  searchTerm: string = '';
  searchResults: Friend[] = [];
  currentUsername: string | null = null;

  friends: Friend[] | null = null;

  constructor(
    private friendshipService: FriendshipService,
    private localStorageService: LocalStorageService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUsername = this.localStorageService.getUsername();
    if (this.currentUsername) {
      this.loadFriends();
    }
  }

  // Load friends and store their usernames locally
  private loadFriends(): void {
    this.friendshipService.getFriendsList(this.currentUsername!).subscribe({
      next: (response: ServiceResponse<Friend[]>) => {
        if (response.success && response.data) {
          this.friends = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load friends:', error);
        this.toastService.showToast('Failed to load friends.', 'danger');
      },
    });
  }

  // Perform search based on the searchTerm entered
  onSearchUsers(): void {
    const trimmedSearchTerm = this.searchTerm.trim();

    if (!trimmedSearchTerm) {
      this.searchResults = [];
      this.isSearchActive = false;
      return;
    }

    this.isSearchActive = true;

    this.friendshipService.searchUsers(trimmedSearchTerm).subscribe({
      next: (response: ServiceResponse<Friend[]>) => {
        const foundUsers = response.data ?? [];

        this.searchResults = foundUsers.map((user: Friend) => {
          const isFriend = this.friends
            ?.map((friend) => friend.username)
            .includes(user.username);
          const hasSentRequest = user.friendStatus === 'Pending'; // Assuming your API gives friendshipStatus
          const hasReceivedRequest = user.friendStatus === 'RequestReceived';

          return {
            ...user,
            isFriend,
            hasSentRequest,
            hasReceivedRequest,
          };
        });

        console.log('Search results:', this.searchResults);
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.toastService.showToast(
          'Error while fetching users: ' + (error.message || 'Unknown error'),
          'danger'
        );
      },
    });
  }

  // Send a friend request
  sendFriendRequest(targetUsername: string): void {
    if (!this.currentUsername) return;

    this.friendshipService
      .sendFriendRequest(this.currentUsername, targetUsername)
      .subscribe({
        next: (response) => {
          this.toastService.showToast('Friend request sent.', 'success');
          this.loadFriends(); // refresh friends
          this.onSearchUsers(); // refresh search list
        },
        error: (error) => {
          console.error('Error sending friend request:', error);
          this.toastService.showToast(
            'Failed to send friend request.',
            'danger'
          );
        },
      });
  }

  // Cancel a friend request
  cancelFriendRequest(targetUsername: string): void {
    this.friendshipService.rejectFriendRequest(targetUsername).subscribe({
      next: (response) => {
        this.toastService.showToast('Friend request cancelled.', 'success');
        this.loadFriends();
        this.onSearchUsers();
      },
      error: (error) => {
        console.error('Error cancelling friend request:', error);
        this.toastService.showToast(
          'Failed to cancel friend request.',
          'danger'
        );
      },
    });
  }

  // Accept a friend request
  acceptFriendRequest(requesterUsername: string): void {
    if (!this.currentUsername) return;

    this.friendshipService
      .acceptFriendRequest(requesterUsername, this.currentUsername)
      .subscribe({
        next: (response) => {
          this.toastService.showToast('Friend request accepted.', 'success');
          this.loadFriends();
          this.onSearchUsers();
        },
        error: (error) => {
          console.error('Error accepting friend request:', error);
          this.toastService.showToast(
            'Failed to accept friend request.',
            'danger'
          );
        },
      });
  }

  // Unfriend a user
  unfriendUser(targetUsername: string): void {
    if (!this.currentUsername) return;

    this.friendshipService
      .unfriendUser(this.currentUsername, targetUsername)
      .subscribe({
        next: (response) => {
          this.toastService.showToast('Unfriended successfully.', 'success');
          this.loadFriends();
          this.onSearchUsers();
        },
        error: (error) => {
          console.error('Error unfriending user:', error);
          this.toastService.showToast('Failed to unfriend user.', 'danger');
        },
      });
  }

  // Block a user
  blockUser(targetUsername: string): void {
    if (!this.currentUsername) return;

    this.friendshipService
      .blockUser(this.currentUsername, targetUsername)
      .subscribe({
        next: (response) => {
          this.toastService.showToast('User blocked.', 'success');
          this.loadFriends();
          this.onSearchUsers();
        },
        error: (error) => {
          console.error('Error blocking user:', error);
          this.toastService.showToast('Failed to block user.', 'danger');
        },
      });
  }

  // Unblock a user
  unblockUser(targetUsername: string): void {
    if (!this.currentUsername) return;

    this.friendshipService
      .unblockUser(this.currentUsername, targetUsername)
      .subscribe({
        next: (response) => {
          this.toastService.showToast('User unblocked.', 'success');
          this.loadFriends();
          this.onSearchUsers();
        },
        error: (error) => {
          console.error('Error unblocking user:', error);
          this.toastService.showToast('Failed to unblock user.', 'danger');
        },
      });
  }
}
