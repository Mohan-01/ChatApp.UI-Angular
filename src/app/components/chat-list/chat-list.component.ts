import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { PrivateChatDto } from '../../models/chat-service/chat/chat.model';
import { ChatService } from '../../services/chat.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { ToastService } from '../../services/toast.service';
import { RouterModule } from '@angular/router';
import { ServiceResponse } from '../../models/response.model';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent {
  isSearchActive = false;
  currentUsername: string | null = null; // Logged-in user ID

  chats: PrivateChatDto[] = [];
  isMobile: boolean = false;
  error: string | null = null;

  constructor(
    private chatService: ChatService,
    private localStorageService: LocalStorageService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 992; // Adjust based on your breakpoint

    this.currentUsername = this.localStorageService.getUsername();

    this.loadChats();
  }

  private loadChats(): void {
    if (!this.currentUsername) return;
    this.chatService.getChatsByUsername(this.currentUsername).subscribe(
      (response: ServiceResponse<PrivateChatDto[]>) => {
        this.chats = response.data || [];
        if (this.chats.length === 0) {
          this.error = 'No chats found.';
        } else {
          // this.onChatSelect(this.chats[1]);
        }
      },
      (error: any) => {
        console.error('Error fetching chat list:', error);
        this.toastService.showToast('Error fetching chat list', 'danger', 3000);
      }
    );
  }
}
