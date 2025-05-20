import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  Observable,
} from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';
import {
  InitializePrivateChatDto,
  PrivateChatDto,
} from '../../models/chat-service/chat/chat.model';
import {
  MessageDto,
  SendMessageDto,
} from '../../models/chat-service/Message/message.model';
import {
  InitializeUserDto,
  UserDto,
} from '../../models/user-service/user.service.model';
import { SignlaRService } from '../../services/signlar.service';
import { v4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceResponse } from '../../models/response.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  private messagesSubject = new BehaviorSubject<MessageDto[]>([]);
  public messages$: Observable<MessageDto[]> =
    this.messagesSubject.asObservable();

  private messageStatusSubject = new BehaviorSubject<Map<string, string>>(
    new Map()
  );
  public messageStatusMap$ = this.messageStatusSubject.asObservable();

  newMessageText: string = '';
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  selectedChat: PrivateChatDto = InitializePrivateChatDto;
  toUserProfile: UserDto | null = InitializeUserDto;

  toUser: string | null = null;
  currentUsername: string | null = null;
  connectionState: string = 'disconnected';
  showProfile = false;
  isChatFocused: boolean = false; // Track whether the chat is focused or not

  constructor(
    private chatService: ChatService,
    private signalRService: SignlaRService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeCurrentUser();
    this.setupSignalRListeners();
    this.signalRService.startConnection();
    this.route.params.subscribe((params) => {
      this.toUser = params['username'];
      this.getChat();
      window.addEventListener('focus', this.handleFocus.bind(this)); // Listen for focus event
      window.addEventListener('blur', this.handleBlur.bind(this)); // Listen for blur event
    });
  }

  //#region override methods and change listeners
  @HostListener('document:visibilitychange', ['$event'])
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.markMessagesAsRead();
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
    window.removeEventListener('focus', this.handleFocus.bind(this));
    window.removeEventListener('blur', this.handleBlur.bind(this));
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    }, 0);
    this.scrollToBottom();
  }
  //#endregion override methods and change listeners

  //#region Profile
  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile(event: Event) {
    event.stopPropagation();
    this.showProfile = false;
  }

  // getProfileOfToUser() {
  //   if (this.toUser) {
  //     this.userService
  //       .getUserByUsername(this.toUser)
  //       .subscribe((user: UserResponse) => {
  //         this.toUserProfile = user;
  //       });
  //   }
  //   return '';
  // }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.showProfile) {
      const targetElement = event.target as HTMLElement;
      if (
        !targetElement.closest('.profile-hover-box') &&
        !targetElement.closest('.chat-title')
      ) {
        this.showProfile = false;
      }
    }
  }
  //#endregion Profile

  goBack() {
    this.router.navigate(['/chat']);
  }

  sendMessage(): void {
    if (!this.newMessageText.trim()) return;

    const tempMessage = this.createMessage();
    this.signalRService.sendMessage(tempMessage);
    // this.addMessage({
    //   messageId: new Date(Date.now()).toLocaleTimeString(),
    //   clientId: v4(),
    //   from: tempMessage.from,
    //   to: tempMessage.to,
    //   time: tempMessage.time,
    //   text: tempMessage.text,
    //   messageType: tempMessage.messageType,
    //   repliedTo: '',
    //   isEdited: false,
    //   messageStatus: 'Sending',
    // });
    // this.addMessage(tempMessage);
    this.newMessageText = '';
  }

  private setupSignalRListeners(): void {
    // Subscribe to connection state changes
    this.signalRService.connectionState$.subscribe((state) => {
      this.connectionState = state;
    });

    // Listen for new messages
    this.signalRService.messageReceived$
      .pipe(
        filter((message): message is MessageDto => message !== null),
        distinctUntilChanged()
      )
      .subscribe((newMessage) => {
        // console.log({ newMessage });
        this.addMessage(newMessage);
      });

    // Listen for message status updates
    // this.signalRService.messageStatus$.subscribe((statusMap) => {
    //   // console.log('message status upddated');
    //   const currentMessages = this.messagesSubject.value || [];
    //   this.messagesSubject.next(
    //     currentMessages.map((msg) => ({
    //       ...msg,
    //       messageStatus: statusMap.get(msg.messageId) || msg.messageStatus,
    //     }))    //   );
    // });
    this.signalRService.messageStatus$.subscribe((statusMap) => {
      console.log({ statusMap });
      const updatedMessages = this.messagesSubject.value.map((msg) => {
        if (statusMap.has(msg.messageId)) {
          return {
            ...msg,
            messageStatus: statusMap.get(msg.messageId)!, // non-null assertion since we checked `has`
          };
        }
        return msg;
      });
      console.log({ updatedMessages });
      this.messagesSubject.next(updatedMessages);
    });
  }

  private getChat(): void {
    if (!this.currentUsername || !this.toUser) return;

    this.chatService.getChatByUsernames(this.toUser).subscribe(
      (response: ServiceResponse<PrivateChatDto>) => {
        this.selectedChat = response.data || InitializePrivateChatDto;
        console.log({ chat: this.selectedChat });
        this.loadMessageDtos();
        this.markMessagesAsRead();
      },
      (error) => {
        this.toastService.showToast(
          error.error?.message ||
            'Failed to load chat. Please try again later.',
          'danger'
        );
      }
    );
  }

  private loadMessageDtos(): void {
    if (!this.selectedChat.chatId) return;

    this.chatService.getMessages(this.selectedChat.chatId).subscribe(
      (response: ServiceResponse<MessageDto[]>) => {
        console.log({ response });
        const messages = response.data;

        this.messagesSubject.next(messages);
        console.log({ messages });

        this.toUser =
          this.currentUsername === this.selectedChat.username1
            ? this.selectedChat.username2
            : this.selectedChat.username1;
        this.scrollToBottom();
      },
      (error) => {
        this.toastService.showToast(
          error.error?.message ||
            'Failed to load messages. Please try again later.',
          'danger'
        );
      }
    );
  }

  private markMessagesAsRead(): void {
    if (
      !this.selectedChat.chatId ||
      !this.currentUsername ||
      !this.isChatFocused
    )
      return;

    const unreadMessages = this.messagesSubject.value.filter(
      (msg) =>
        msg.to.toLowerCase() === this.currentUsername &&
        msg.messageStatus.toLowerCase() !== 'seen'
    );

    unreadMessages.forEach((msg) => {
      if (msg.from === this.toUser) {
        msg.messageStatus = 'Seen';
        this.signalRService.markMessageAsRead(msg);
      }
    });

    this.messagesSubject.next([...this.messagesSubject.value]);
  }

  private addMessage(newMessage: MessageDto): void {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map((msg) =>
      msg.messageId === newMessage.messageId ? { ...msg, ...newMessage } : msg
    );

    if (
      !currentMessages.some((msg) => msg.messageId === newMessage.messageId) &&
      (newMessage.to === this.toUser || newMessage.from === this.toUser)
    ) {
      this.markMessagesAsRead();
      updatedMessages.push(newMessage);

      this.messagesSubject.next(updatedMessages);
      this.scrollToBottom();
    }
  }

  //#region Helper methods
  private createMessage(): SendMessageDto {
    if (!this.currentUsername) {
      throw new Error('User should be logged in first');
    }
    if (!this.toUser) {
      throw new Error('Recipient user ID is not provided');
    }
    return {
      chatId: this.selectedChat.chatId,
      from: this.currentUsername,
      to: this.toUser,
      time: new Date(Date.now()),
      text: this.newMessageText.trim(),
      messageType: 'Text',
      repliedTo: '',
    };
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
    if (this.messagesContainer) {
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }

  // Handle window focus (chat comes into view)
  private handleFocus(): void {
    this.isChatFocused = true;
    this.markMessagesAsRead(); // Mark messages as read when chat is focused
  }

  // Handle window blur (chat goes out of view)
  private handleBlur(): void {
    this.isChatFocused = false;
  }

  //#endregion
}
