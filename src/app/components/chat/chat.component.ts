import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import {
  Subject,
  takeUntil,
  combineLatest,
  map,
  filter,
  distinctUntilChanged,
  tap,
  Observable,
} from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatService } from '../../services/chat.service';
import { SignlaRService } from '../../services/signlar.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { ToastService } from '../../services/toast.service';

import {
  InitializePrivateChatDto,
  PrivateChatDto,
} from '../../models/chat-service/chat/chat.model';
import {
  MessageDto,
  MessageStatus,
  SendMessageDto,
} from '../../models/chat-service/Message/message.model';
import {
  UserDto,
  InitializeUserDto,
} from '../../models/user-service/user.service.model';
import { ServiceResponse } from '../../models/response.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  newMessageText = '';
  selectedChat: PrivateChatDto = InitializePrivateChatDto;
  toUserProfile: UserDto | null = InitializeUserDto;
  currentUsername: string | null = null;
  toUser: string | null = null;
  isChatFocused = false;
  showProfile = false;

  messages$: Observable<MessageDto[]>;
  unreadMessages$: Observable<MessageDto[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService,
    private signalRService: SignlaRService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {
    this.messages$ = this.signalRService.messages$;
    this.unreadMessages$ = combineLatest([
      this.messages$,
      this.route.params,
    ]).pipe(
      map(([messages, params]) =>
        messages.filter(
          (msg) =>
            msg.to.toLowerCase() === this.currentUsername &&
            msg.messageStatus === MessageStatus.Delivered &&
            msg.from === params['username']
        )
      )
    );
  }

  ngOnInit(): void {
    this.initializeCurrentUser();
    this.signalRService.startConnection();
    this.setupSignalRListeners();
    this.listenToRouteChanges();
  }

  ngAfterViewInit(): void {
    this.messageInput?.nativeElement.focus();
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:focus')
  onFocus(): void {
    this.isChatFocused = true;
    this.markMessagesAsRead();
  }

  @HostListener('window:blur')
  onBlur(): void {
    this.isChatFocused = false;
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.markMessagesAsRead();
    }
  }

  goBack(): void {
    this.router.navigate(['/chat']);
  }

  sendMessage(): void {
    if (!this.newMessageText.trim() || !this.currentUsername || !this.toUser)
      return;

    const message: SendMessageDto = {
      chatId: this.selectedChat.chatId,
      from: this.currentUsername,
      to: this.toUser,
      time: new Date(),
      text: this.newMessageText.trim(),
      messageType: 'Text',
      repliedTo: '',
    };

    const optimisticMessage: MessageDto = {
      messageId: '', // Will be updated by server
      chatId: message.chatId,
      clientId: self.crypto.randomUUID(),
      from: message.from,
      to: message.to,
      text: message.text,
      time: new Date(Date.now()),
      messageType: 'Text',
      repliedTo: '',
      isEdited: false,
      messageStatus: MessageStatus.Sent,
    };

    this.signalRService.sendMessage(message, optimisticMessage);
    this.scrollToBottom();
    this.newMessageText = '';
  }

  private listenToRouteChanges(): void {
    this.route.params
      .pipe(
        map((params) => params['username']),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((username) => {
        this.toUser = username;
        this.getChat();
      });
  }

  private setupSignalRListeners(): void {
    this.signalRService.messageReceived$
      .pipe(
        filter((message): message is MessageDto => !!message),
        distinctUntilChanged(),
        tap(() => {
          this.scrollToBottom();
          this.markMessagesAsRead();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private getChat(): void {
    if (!this.currentUsername || !this.toUser) return;

    this.chatService
      .getChatByUsernames(this.toUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ServiceResponse<PrivateChatDto>) => {
          this.selectedChat = res.data || InitializePrivateChatDto;
          this.loadMessages();
        },
        error: (err) =>
          this.toastService.showToast(
            err.error?.message ||
              'Failed to load chat. Please try again later.',
            'danger'
          ),
      });
  }

  /**
   * Fetches messages for the selected chat and marks them as read
   * This function is the main entry point for loading messages and store them in the signalRService message$
   * After messages are loaded, and marked as read, it scrolls the messages container to the bottom
   * @returns None
   */
  private loadMessages(): void {
    if (!this.selectedChat.chatId) return;

    this.chatService
      .getMessages(this.selectedChat.chatId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ServiceResponse<MessageDto[]>) => {
          this.signalRService.setMessages(res.data);
          this.toUser =
            this.selectedChat.username1 === this.currentUsername
              ? this.selectedChat.username2
              : this.selectedChat.username1;

          this.scrollToBottom();

          setTimeout(() => this.markMessagesAsRead(), 500);
        },
        error: (err) =>
          this.toastService.showToast(
            err.error?.message || 'Failed to load messages.',
            'danger'
          ),
      });
  }

  /**
   * If chat get focused then mark messages as read
   * @returns None
   */
  private markMessagesAsRead(): void {
    console.log('Marking read:', {
      isChatFocused: this.isChatFocused,
      visibility: document.visibilityState,
      toUser: this.toUser,
      currentUsername: this.currentUsername,
      selectedChatId: this.selectedChat.chatId,
    });

    if (
      document.visibilityState !== 'visible' ||
      !this.selectedChat.chatId ||
      !this.toUser
    )
      return;

    this.messages$.pipe(takeUntil(this.destroy$)).subscribe((messages) => {
      messages
        .filter(
          (msg: MessageDto) =>
            msg.to.toLowerCase() === this.currentUsername &&
            msg.messageStatus === MessageStatus.Delivered &&
            msg.from === this.toUser
        )
        .forEach((msg) => this.signalRService.markMessageAsRead(msg));
    });
  }

  private initializeCurrentUser(): void {
    this.currentUsername = this.localStorageService.getUsername();
    if (!this.currentUsername) {
      this.toastService.showToast(
        'Login session expired. Please log in again.',
        'warning'
      );
      this.router.navigate(['/login']);
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }
}
