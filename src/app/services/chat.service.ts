import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { PrivateChatDto } from '../models/chat-service/chat/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.chatApiUrl; // Replace with your actual API URL
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Ocp-Apim-Subscription-Key': 'ed98709dead64eca845fca9e43b933cb',
    });
  }

  constructor(private http: HttpClient) {}

  getMessages(chatId: string): Observable<PrivateChatDto> {
    return this.http.get<PrivateChatDto>(`${this.apiUrl}/chat/${chatId}`, {
      headers: this.createHeaders(),
    });
  }

  getChatsByUsername(username: string): Observable<PrivateChatDto[]> {
    return this.http.get<PrivateChatDto[]>(
      `${this.apiUrl}/chat/user/${username}`,
      {
        headers: this.createHeaders(),
      }
    );
  }

  getChatByUsernames(username2: string): Observable<PrivateChatDto> {
    return this.http.get<PrivateChatDto>(`${this.apiUrl}/chat/${username2}`, {
      headers: this.createHeaders(),
    });
  }

  sendMessage(body: {
    from: string;
    to: string;
    text: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/message/send`, body, {
      headers: this.createHeaders(),
    });
  }

  createChat(username1: string, username2: string): Observable<PrivateChatDto> {
    return this.http.post<PrivateChatDto>(
      `${this.apiUrl}/chat/create`,
      { username1, username2 },
      { headers: this.createHeaders() }
    );
  }
}
