import { Component } from '@angular/core';
import { UserServiceResponse } from '../../models/user-service/user.service.response.model';
import { SearchUserDto } from '../../models/user-service/user.service.model';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {
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
    this.chatService.getChatByUsernames(usernam2);
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
        this.toastService.showToast('Searedc user: {search}', 'success');
      },
      error: () => {
        this.searchResults = [];
        this.toastService.showToast('Search failed.', 'danger');
      },
    });
  }
}
