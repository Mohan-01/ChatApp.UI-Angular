import { CommonModule } from '@angular/common';
import { AuthService } from './../../services/auth.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { PrivateChatDto } from '../../models/chat-service/chat/chat.model';
import { ChatService } from '../../services/chat.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { ChatListComponent } from '../chat-list/chat-list.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ChatListComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  selectedChat: PrivateChatDto | null = null;
  isChatListVisible: boolean = true;
  isAuthenticated$;
  isMobile: boolean = window.innerWidth < 768; // 🔹 Added isMobile detection

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  /** Listen for window resize to update mobile view */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
  }
}
