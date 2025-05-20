import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr'; // Use the correct import for signalR
import { BehaviorSubject } from 'rxjs';
import {
  ChangeMessageStatus,
  MessageDto,
  SendMessageDto,
} from '../models/chat-service/Message/message.model';
import { LocalStorageService } from './local-storage.service';
import { ToastService } from './toast.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignlaRService {
  private hubConnection!: signalR.HubConnection;

  private messages: MessageDto[] = [];
  private messagesSubject = new BehaviorSubject<MessageDto[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  // Subjects for real-time data streaming
  private messageReceivedSubject = new BehaviorSubject<MessageDto | null>(null);
  public messageReceived$ = this.messageReceivedSubject.asObservable();
  // Store message statuses (Key: messageId, Value: status)
  private messageStatusMap = new Map<string, string>();
  private messageStatusSubject = new BehaviorSubject<Map<string, string>>(
    this.messageStatusMap
  );
  public messageStatus$ = this.messageStatusSubject.asObservable();

  private userConnectedSubject = new BehaviorSubject<any | null>(null);
  public userConnected$ = this.userConnectedSubject.asObservable();

  private userDisconnectedSubject = new BehaviorSubject<any | null>(null);
  public userDisconnected$ = this.userDisconnectedSubject.asObservable();

  private connectionStateSubject = new BehaviorSubject<string>('disconnected');
  public connectionState$ = this.connectionStateSubject.asObservable();

  constructor(
    private localStorageService: LocalStorageService,
    private toastService: ToastService
  ) {}

  /**
   * Start the SignalR connection with the configuration.
   */
  public startConnection(): void {
    if (
      this.hubConnection &&
      this.hubConnection.state === signalR.HubConnectionState.Connected
    ) {
      console.log('SignalR connection already established');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRHubUrl}`, {
        accessTokenFactory: () =>
          this.localStorageService.getItem('token') || '',
      })
      .withHubProtocol(new signalR.JsonHubProtocol()) // Ensures JSON format
      .configureLogging(signalR.LogLevel.Debug) // Enables detailed logs
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connection started');
        this.connectionStateSubject.next('connected');
        this.hubConnection.invoke('JustCheck');
        this.registerHandlers(); // Register the event handlers once connected
      })
      .catch((err) => {
        console.error('Error while starting connection: ', err);
        this.connectionStateSubject.next('disconnected');
      });

    this.hubConnection.onreconnecting(() => {
      console.warn('SignalR reconnecting...');
      this.connectionStateSubject.next('reconnecting');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.connectionStateSubject.next('connected');
    });

    this.hubConnection.onclose(() => {
      console.error('SignalR connection closed');
      this.connectionStateSubject.next('disconnected');
    });
  }

  /**
   * Register SignalR event handlers.
   */
  private registerHandlers(): void {
    this.hubConnection.on('JustCheck', () => {
      console.log('JustCheck');
      alert('JustCheck');
    });
    // Receive a new message
    this.hubConnection.on('ReceiveMessage', (message: MessageDto) => {
      this.messageReceivedSubject.next(message);
      // Trigger toast for the new message
      this.toastService.showToast(
        `New message received from ${message.from}\n${
          message.text.length > 4
            ? message.text.slice(0, 4) + '...'
            : message.text
        }`,
        'info'
      );
      console.log('Message received:', message);
    });

    // Notify when a user connects
    this.hubConnection.on('UserConnected', (user) => {
      this.userConnectedSubject.next(user);
      console.log('User connected:', user);
    });

    // Notify when a user disconnects
    this.hubConnection.on('UserDisconnected', (user) => {
      this.userDisconnectedSubject.next(user);
      console.log('User disconnected:', user);
    });

    // Notify the sender about message status
    this.hubConnection.on(
      'MessageStatusUpdated',
      (updatedMessage: MessageDto) => {
        this.messageReceivedSubject.next({
          ...updatedMessage,
          messageStatus: updatedMessage.messageStatus,
        });
        if (updatedMessage.messageId && updatedMessage.messageStatus) {
          this.messageStatusMap.set(
            updatedMessage.messageId,
            updatedMessage.messageStatus
          );
          this.messageStatusSubject.next(new Map(this.messageStatusMap)); // Emit updated map
          console.log('Message status updated:', updatedMessage);
        }
      }
    );

    // Handle errors
    this.hubConnection.on('Error', (errorMessage: string) => {
      throw new Error('Error received from server: ' + errorMessage);
    });
  }

  /**
   * Send a message to the SignalR hub.
   * @param message - The message DTO to send
   */
  public sendMessage(message: SendMessageDto): void {
    if (
      this.hubConnection &&
      this.hubConnection.state === signalR.HubConnectionState.Connected
    ) {
      console.log(this.hubConnection);
      console.log({ message });
      this.hubConnection
        .invoke('SendMessage', message)
        .catch((err) => console.error('Error while sending message:', err));
    } else {
      throw new Error('SignalR connection is not established.');
    }
  }

  public markMessageAsRead(message: ChangeMessageStatus): void {
    if (
      this.hubConnection &&
      this.hubConnection.state === signalR.HubConnectionState.Connected
    ) {
      this.hubConnection
        .invoke('MarkMessageAsRead', message)
        .catch((err) =>
          console.error('Error while marking message as read:', err)
        );
    } else {
      throw new Error('SignalR connection is not established.');
    }
  }

  /**
   * Stop the SignalR connection.
   */
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection
        .stop()
        .then(() => {
          console.log('SignalR connection stopped');
          this.connectionStateSubject.next('disconnected');
        })
        .catch((err) => {
          console.error('Error while stopping SignalR connection:', err);
        });
    }
  }

  private upsertMessage(message: MessageDto): void {
    const index = this.messages.findIndex(
      (m) =>
        (message.clientId && m.clientId === message.clientId) ||
        (message.messageId && m.messageId === message.messageId)
    );

    if (index !== -1) {
      this.messages[index] = { ...this.messages[index], ...message };
    } else {
      this.messages.push(message);
    }

    this.messagesSubject.next([...this.messages]);
  }
}
