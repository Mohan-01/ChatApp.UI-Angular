import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { PrivateChatDto } from '../models/chat-service/chat/chat.model';
import { ServiceResponse } from '../models/response.model';
import { MessageDto } from '../models/chat-service/Message/message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.chatApiUrl; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  getMessages(chatId: string): Observable<ServiceResponse<MessageDto[]>> {
    return this.http.get<ServiceResponse<MessageDto[]>>(
      `${this.apiUrl}/message/chat/${chatId}`,
      {
        withCredentials: true,
      }
    );
  }

  getChatsByUsername(
    username: string
  ): Observable<ServiceResponse<PrivateChatDto[]>> {
    return this.http.get<ServiceResponse<PrivateChatDto[]>>(
      `${this.apiUrl}/chat/user/${username}`,
      {
        withCredentials: true,
      }
    );
  }

  getChatByUsernames(
    username2: string
  ): Observable<ServiceResponse<PrivateChatDto>> {
    return this.http.get<ServiceResponse<PrivateChatDto>>(
      `${this.apiUrl}/chat/${username2}`,
      {
        withCredentials: true,
      }
    );
  }

  sendMessage(body: {
    from: string;
    to: string;
    text: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/message/send`, body, {
      withCredentials: true,
    });
  }

  createChat(username1: string, username2: string): Observable<PrivateChatDto> {
    return this.http.post<PrivateChatDto>(
      `${this.apiUrl}/chat/create`,
      { username1, username2 },
      { withCredentials: true }
    );
  }
}
