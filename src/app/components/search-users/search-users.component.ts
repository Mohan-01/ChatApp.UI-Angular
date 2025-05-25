import { HttpClientModule } from '@angular/common/http';
import { UserServiceResponse } from './../../models/user-service/user.service.response.model';
import { UserService } from './../../services/user.service';
import { ChatService } from './../../services/chat.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '../../services/local-storage.service';
import { ToastService } from '../../services/toast.service';
import { SearchUserDto } from '../../models/user-service/user.service.model';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-search-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.css'],
})
export class SearchUsersComponent implements OnInit {
  searchTerm: string = '';
  searchResults: SearchUserDto[] = [];
  currentUsername: string | null = null;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUsername = this.localStorageService.getUsername();
  }

  getChatByUsername(usernam2: string) {
    this.chatService.getChatByUsernames(usernam2).subscribe();
  }

  // Perform search based on the searchTerm entered
  onSearchUsers(): void {
    const trimmedSearchTerm = this.searchTerm.trim();

    if (!trimmedSearchTerm) {
      this.searchResults = [];
      return;
    }

    // Simulate API call or actual search
    this.userService.searchUsers({ searchTerm: trimmedSearchTerm }).subscribe({
      next: (results: UserServiceResponse<SearchUserDto[]>) => {
        if (results.data == undefined) this.searchResults = [];
        else this.searchResults = results.data;
      },
      error: () => {
        this.searchResults = [];
        this.toastService.showToast('Search failed.', 'danger');
      },
    });
  }
}

/*
<!-- Search bar: center in desktop, hidden in mobile -->
<div
  class="position-absolute top-50 start-50 translate-middle d-none d-lg-block"
  style="width: 35%"
>
  <form class="d-flex w-100" role="search">
    <input
      class="form-control w-100"
      type="search"
      placeholder="Search"
      aria-label="Search"
    />
  </form>
</div>

<!-- Right section: search icon in mobile + nav links + toggler -->
<div class="d-flex align-items-center ms-auto">
  <!-- Mobile Search Bar (100% width on mobile, hidden on desktop) -->
  <div class="d-lg-none w-100 my-2">
    <form class="d-flex w-100" role="search">
      <input
        class="form-control w-100"
        type="search"
        placeholder="Search"
        aria-label="Search"
      />
    </form>
  </div>

  <!-- Toggler button (hamburger menu) -->
  <button
    class="navbar-toggler"
    type="button"
    data-bs-toggle="collapse"
    data-bs-target="#navbarTogglerDemo02"
    aria-controls="navbarTogglerDemo02"
    aria-expanded="false"
    aria-label="Toggle navigation"
  >
    <span class="navbar-toggler-icon"></span>
  </button>
</div>

<!-- Desktop Search Bar -->
<div
  class="position-absolute top-50 start-50 translate-middle d-none d-lg-block"
  style="width: 35%; z-index: 1050"
>
  <form
    class="d-flex w-100"
    role="search"
    (submit)="onSearchUsers(); $event.preventDefault()"
  >
    <input
      class="form-control w-100"
      type="search"
      [(ngModel)]="searchTerm"
      name="search"
      placeholder="Search"
      aria-label="Search"
      (input)="onSearchUsers()"
    />
  </form>

  <!-- Desktop Search Results Dropdown -->
  <div
    *ngIf="searchResults.length > 0"
    class="bg-white border rounded mt-1 shadow position-absolute"
    style="width: 100%; max-height: 300px; overflow-y: auto; z-index: 1060"
  >
    <div
      *ngFor="let user of searchResults"
      class="p-2 border-bottom hover-bg-light cursor-pointer"
      (click)="getChatByUsername(user.username)"
    >
      {{ user.username }}
    </div>
  </div>
</div>
*/

/*
<!-- Desktop Search Bar -->
<div
  class="position-absolute top-50 start-50 translate-middle d-none d-lg-block"
  style="width: 35%; z-index: 1050"
>
  <form
    class="d-flex w-100"
    role="search"
    (submit)="onSearchUsers(); $event.preventDefault()"
  >
    <input
      [(ngModel)]="searchTerm"
      name="desktopSearch"
      class="form-control w-100"
      type="search"
      placeholder="Search"
      aria-label="Search"
      (input)="onSearchUsers()"
    />
  </form>

  <!-- Search Results -->
  <div
    *ngIf="searchResults.length > 0"
    class="bg-white border rounded mt-1 shadow position-absolute"
    style="width: 100%; max-height: 300px; overflow-y: auto; z-index: 1060"
  >
    <div
      *ngFor="let user of searchResults"
      class="p-2 border-bottom hover-bg-light cursor-pointer"
      (click)="getChatByUsername(user.username)"
    >
      {{ user.username }}
    </div>
  </div>
</div>

<!-- Mobile Search Bar -->
<div class="d-lg-none w-100 my-2 position-relative">
  <form
    class="d-flex w-100"
    role="search"
    (submit)="onSearchUsers(); $event.preventDefault()"
  >
    <input
      [(ngModel)]="searchTerm"
      name="mobileSearch"
      class="form-control w-100"
      type="search"
      placeholder="Search"
      aria-label="Search"
      (input)="onSearchUsers()"
    />
  </form>

  <!-- Mobile Results -->
  <div
    *ngIf="searchResults.length > 0"
    class="bg-white border rounded mt-1 shadow position-absolute"
    style="width: 100%; max-height: 300px; overflow-y: auto; z-index: 1060"
  >
    <div
      *ngFor="let user of searchResults"
      class="p-2 border-bottom hover-bg-light cursor-pointer"
      (click)="getChatByUsername(user.username)"
    >
      {{ user.username }}
    </div>
  </div>
</div>
*/
