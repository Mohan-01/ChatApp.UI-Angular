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

  // repsonsible to maintain all the message from server
  private messagesSubject = new BehaviorSubject<MessageDto[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  // Subjects for real-time data streaming
  // responsible for real-time chat(single message)
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
      .withUrl(`${environment.signalRHubUrl}`)
      .withHubProtocol(new signalR.JsonHubProtocol()) // Ensures JSON format
      .configureLogging(signalR.LogLevel.Debug) // Enables detailed logs
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connection started');
        this.connectionStateSubject.next('connected');
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
    this.onWithCleanup<[MessageDto, string]>(
      'ReceiveMessage',
      (message: MessageDto, clientId: string) => {
        this.upsertMessage(clientId, message);
        this.messageReceivedSubject.next(message);
        this.markMessageAsDelivered(message);

        this.toastService.showToast(
          `New message received from ${message.from}\n${
            message.text.length > 4
              ? message.text.slice(0, 4) + '...'
              : message.text
          }`,
          'info'
        );
      }
    );

    // Notify when a user connects
    this.onWithCleanup<[any]>('UserConnected', (user) => {
      this.userConnectedSubject.next(user);
      console.log('User connected:', user);
    });

    // Notify when a user disconnects
    this.onWithCleanup<[any]>('UserDisconnected', (user) => {
      this.userDisconnectedSubject.next(user);
      console.log('User disconnected:', user);
    });

    // Notify the sender about message status
    this.onWithCleanup<[MessageDto, string?]>(
      'MessageStatusUpdated',
      (updatedMessage: MessageDto, clientId?: string) => {
        console.log({ updatedMessage });
        this.upsertMessage(clientId ?? updatedMessage.clientId, updatedMessage); // Properly updates message in the stream

        if (updatedMessage.messageId && updatedMessage.messageStatus) {
          this.messageStatusMap.set(
            updatedMessage.messageId,
            updatedMessage.messageStatus
          );
          this.messageStatusSubject.next(new Map(this.messageStatusMap));
        }
      }
    );

    // Handle errors
    this.onWithCleanup<[string]>('Error', (errorMessage: string) => {
      throw new Error('Error received from server: ' + errorMessage);
    });
  }

  /**
   * Send a message to the SignalR hub.
   * @param message - The message DTO to send
   */
  public sendMessage(
    message: SendMessageDto,
    optimisticMessage: MessageDto
  ): void {
    if (
      this.hubConnection &&
      this.hubConnection.state === signalR.HubConnectionState.Connected
    ) {
      this.upsertMessage(optimisticMessage.clientId, optimisticMessage); // Optimistically add message

      this.hubConnection
        .invoke('SendMessage', message, optimisticMessage.clientId) // Pass clientId for sync
        .catch((err) => {
          console.error('Error while sending message:', err);
          this.toastService.showToast('Failed to send message', 'warning');
        });
    } else {
      throw new Error('SignalR connection is not established.');
    }
  }

  public markMessageAsDelivered(message: ChangeMessageStatus): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('MarkMessageAsDelivered', message)
        .catch((err) =>
          console.error('Error while marking message as delivered: ' + err)
        );
    } else {
      throw new Error('SignalR connection is not established.');
    }
  }

  public markMessageAsRead(message: ChangeMessageStatus): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('MarkMessageAsRead', message)
        .catch((err) =>
          console.error('Error while marking message as read: ' + err)
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
          console.error('Error while stopping SignalR connection: ' + err);
        });
    }
  }

  /**
   * This is responsible for
   * 1. Insert new message into the stream to reflect in UI
   * 2. Update existing message(text, status)
   * @param clientId
   * @param message
   */
  public upsertMessage(clientId: string, message: MessageDto): void {
    const currentMessages = this.messagesSubject.getValue();

    const index = currentMessages.findIndex(
      (m) =>
        (!!clientId && m.clientId === clientId) ||
        (!!message.messageId && m.messageId === message.messageId)
    );

    let updatedMessages: MessageDto[];
    if (index !== -1) {
      // Update existing message
      updatedMessages = [...currentMessages];
      updatedMessages[index] = { ...updatedMessages[index], ...message };
    } else {
      // Add new message
      updatedMessages = [...currentMessages, message];
    }

    this.messagesSubject.next(updatedMessages);
  }

  public setMessages(messages: MessageDto[]): void {
    this.messagesSubject.next(messages);
  }

  get messagesValue(): MessageDto[] {
    return this.messagesSubject.value;
  }

  private onWithCleanup<T extends any[]>(
    methodName: string,
    newHandler: (...args: T) => void
  ): void {
    this.hubConnection.off(methodName);
    this.hubConnection.on(methodName, newHandler);
  }
}
