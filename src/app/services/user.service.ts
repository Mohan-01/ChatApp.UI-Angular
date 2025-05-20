import { LocalStorageService } from './local-storage.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  SearchUserDto,
  UserDto,
} from '../models/user-service/user.service.model';
import { UserServiceResponse } from '../models/user-service/user.service.response.model';
import {
  SearchUsersRequest,
  UpdateUserRequest,
} from '../models/user-service/user.service.request.model';

/**
 *
 * Get User Profile
 * Update User details
 * Search the Users : SearchUserDto
 *
 */

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userApiUrl = environment.userApiUrl;

  constructor(private http: HttpClient) {}

  getUserProfileDetails(): Observable<UserServiceResponse<UserDto>> {
    return this.http.get<UserServiceResponse<UserDto>>(`${this.userApiUrl}`, {
      withCredentials: true,
    });
  }

  updateUser(
    updateUserRequest: UpdateUserRequest
  ): Observable<UserServiceResponse<UserDto>> {
    return this.http.put<UserServiceResponse<UserDto>>(
      `${this.userApiUrl}`,
      updateUserRequest,
      {
        withCredentials: true,
      }
    );
  }
  searchUsers(
    searchUsersRequest: SearchUsersRequest
  ): Observable<UserServiceResponse<SearchUserDto[]>> {
    return this.http.get<UserServiceResponse<SearchUserDto[]>>(
      `${this.userApiUrl}/search?searchTerm=${searchUsersRequest.searchTerm}`,
      {
        withCredentials: true,
      }
    );
  }
}
