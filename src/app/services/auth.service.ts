import {
  ChangePasswordRequest,
  ChangeUsernameRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateEmailRequest,
} from '../models/auth-service/auth.service.request.model';
import { LocalStorageService } from './local-storage.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import { ToastService } from './toast.service';
import { environment } from '../environments/environment';
import {
  AuthResponse,
  AuthServiceResponse,
} from '../models/auth-service/auth.service.response.model';
import { RegisterRequest } from '../models/auth-service/auth.service.request.model';

/**
 *
 * Authenticate User - done
 * Register - done
 * Login - (Store username in local storage) (maintain authenticated subject) - done
 * Logout - (Clear local storage) - done
 * Forgot Username - done
 * Forgot Password - done
 * Reset Password - done
 * Change Username - done
 * Change Email - done
 * Change Password - done
 * Delete Account
 *
 */

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authApiUrl = environment.authApiUrl;
  private isAutenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAutenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private localStorageService: LocalStorageService
  ) {
    if (this.localStorageService.getUsername()) this.AuthenticateUser();
  }

  private AuthenticateUser() {
    this.http
      .get(`${this.authApiUrl}/authenticate-user`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.isAutenticatedSubject.next(true);
        },
        error: (error) => {
          this.isAutenticatedSubject.next(false);
          this.toastService.showToast(
            'Session expired or unauthorized. Please log in again.',
            'danger'
          );
        },
      });
  }

  // 📝 Normal register
  register(
    registerRequest: RegisterRequest
  ): Observable<AuthServiceResponse<AuthResponse>> {
    return this.http.post<AuthServiceResponse<AuthResponse>>(
      `${this.authApiUrl}/register`,
      registerRequest
    );
  }

  // 🔐 Normal Login
  login(credentials: {
    username: string;
    password: string;
  }): Observable<AuthServiceResponse<AuthResponse>> {
    return this.http
      .post<AuthServiceResponse<AuthResponse>>(
        `${this.authApiUrl}/login`,
        credentials,
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(() => this.isAutenticatedSubject.next(true)),
        catchError((error) => {
          console.error('Login failed:', error); // this will guarantee you catch the error
          this.toastService.showToast(
            'Login failed. Please try again.',
            'danger'
          );
          this.isAutenticatedSubject.next(false);
          return throwError(() => error); // propagate the error if needed
        })
      );
  }

  // 🚪 Normal Logout
  logout(): Observable<AuthServiceResponse<string>> {
    return this.http
      .get<AuthServiceResponse<string>>(`${this.authApiUrl}/logout`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.localStorageService.clear();
            this.isAutenticatedSubject.next(false);
            this.toastService.showToast('Logged out successfully', 'success');
          } else {
            this.toastService.showToast(
              'Logout failed: ' + response.message,
              'danger'
            );
          }
        }),
        catchError((error) => {
          console.error('Logout API error:', error);
          this.toastService.showToast(
            'Logout failed: ' + (error.error?.message || 'Unknown error'),
            'danger'
          );
          // Properly return an EMPTY observable (rxjs)
          return of({
            data: '',
            message: 'Logout failed',
            success: false,
          } as AuthServiceResponse<string>);
        })
      );
  }

  changeUsername(
    changeUsernameRequest: ChangeUsernameRequest
  ): Observable<AuthServiceResponse<string>> {
    return this.http.put<AuthServiceResponse<string>>(
      `${this.authApiUrl}/change-username`,
      changeUsernameRequest,
      { withCredentials: true }
    );
  }

  changeEmail(
    updateEmailRequest: UpdateEmailRequest
  ): Observable<AuthServiceResponse<string>> {
    return this.http.put<AuthServiceResponse<string>>(
      `${this.authApiUrl}/update-email`,
      updateEmailRequest,
      { withCredentials: true }
    );
  }

  changePassword(
    changePasswordRequest: ChangePasswordRequest
  ): Observable<AuthServiceResponse<string>> {
    return this.http.put<AuthServiceResponse<string>>(
      `${this.authApiUrl}/change-password`,
      changePasswordRequest,
      { withCredentials: true }
    );
  }

  deleteUser(): Observable<any> {
    return this.http.delete(`${this.authApiUrl}/delete-user`, {
      withCredentials: true,
    });
  }

  forgotUsername(
    forgotUsernameRequest: ForgotPasswordRequest
  ): Observable<AuthServiceResponse<string>> {
    return this.http.post<AuthServiceResponse<string>>(
      `${this.authApiUrl}/forgot-username`,
      forgotUsernameRequest
    );
  }

  // 🔄 Password Reset Request
  forgotPassword(
    forgotPasswordRequest: ForgotPasswordRequest
  ): Observable<AuthServiceResponse<string>> {
    return this.http.post<AuthServiceResponse<string>>(
      `${this.authApiUrl}/forgot-password`,
      forgotPasswordRequest
    );
  }

  // 🔑 Reset Password
  resetPassword(
    resetPasswordRequest: ResetPasswordRequest
  ): Observable<AuthServiceResponse<string>> {
    return this.http.post<AuthServiceResponse<string>>(
      `${this.authApiUrl}/reset-password`,
      resetPasswordRequest
    );
  }
}
