import {
  ChangePasswordRequest,
  InitializeChangePaswordRequest,
} from '../../models/auth-service/auth.service.request.model';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
import { ToastService } from '../../services/toast.service';
import {
  AuthUser,
  InitializeAuthUser,
} from '../../models/auth-service/auth.service.model';
import {
  ChangeUsernameRequest,
  InitializeChangeUsernameRequest,
  InitializeUpdateEmailRequest,
  UpdateEmailRequest,
} from '../../models/auth-service/auth.service.request.model';
import { AuthServiceResponse } from '../../models/auth-service/auth.service.response.model';
import {
  InitializeUserDto,
  UserDto,
} from '../../models/user-service/user.service.model';
import {
  InitializeUpdateUserRequest,
  UpdateUserRequest,
} from '../../models/user-service/user.service.request.model';
import { UserService } from '../../services/user.service';
import { UserServiceResponse } from '../../models/user-service/user.service.response.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  errorMessage: string = '';
  successMessage: string = '';
  defaultProfilePicture =
    'https://th.bing.com/th/id/OIP.8lH9SOh2rz2dCyU_9zVJGgHaHV?w=181&h=180&c=7&r=0&o=5&pid=1.7';

  //#region Authservice Related
  isPasswordChange: boolean = false;
  confirmPassword = '';
  authFieldDisabled = {
    username: true,
    email: true,
    roles: true,
  };

  authServiceFields: AuthUser = InitializeAuthUser;

  changeUsernameRequest: ChangeUsernameRequest;
  updateEmailRequest: UpdateEmailRequest;
  changePaswordRequest: ChangePasswordRequest;
  //#endregion

  //#region Userservice Related
  userProfileDetails: UserDto;
  updateUserRequest: UpdateUserRequest;
  editProfileDetails: boolean = false;
  //#endregion

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private toastService: ToastService
  ) {
    //#region Userservice Related
    this.userProfileDetails = InitializeUserDto;
    this.updateUserRequest = InitializeUpdateUserRequest;

    //#endregion

    //#region Authservice Related
    this.changeUsernameRequest = InitializeChangeUsernameRequest;
    this.updateEmailRequest = InitializeUpdateEmailRequest;
    this.changePaswordRequest = InitializeChangePaswordRequest;

    const localStoredUseranme = this.localStorageService.getUsername();
    const localStoredEmail = this.localStorageService.getItem('email');

    if (!localStoredUseranme || !localStoredEmail) {
      this.router.navigate(['/login']);
      return;
    }

    this.authServiceFields.username = localStoredUseranme;
    this.authServiceFields.email = localStoredEmail;
    this.changeUsernameRequest.newUsername = this.authServiceFields.username;
    this.updateEmailRequest.newEmail = this.authServiceFields.email;
    //#endregion
  }

  ngOnInit(): void {
    this.getUserProfileDetails();
  }

  //#region AuthService Related
  disableUsername(disable: boolean): void {
    this.authFieldDisabled.username = disable;
    this.changeUsernameRequest.newUsername = this.authServiceFields.username;
  }

  disableEmail(disable: boolean): void {
    this.authFieldDisabled.email = disable;
    this.updateEmailRequest.newEmail = this.authServiceFields.email;
  }

  saveUsername(): void {
    if (this.changeUsernameRequest.newUsername)
      this.authService.changeUsername(this.changeUsernameRequest).subscribe({
        next: (response: AuthServiceResponse<string>) => {
          if (!response.success) return;
          this.toastService.showToast(
            'Username updated successfully',
            'success'
          );
          this.localStorageService.setUsername(response.data);
          this.authServiceFields.username = response.data;
          this.disableUsername(true);
        },
        error: (error) => {
          this.toastService.showToast(
            `Failed to update username ${error}`,
            'danger'
          );
        },
      });
  }

  saveEmail(): void {
    if (!this.updateEmailRequest.newEmail) return;

    this.authService.changeEmail(this.updateEmailRequest).subscribe({
      next: (response: AuthServiceResponse<string>) => {
        if (!response.success) return;
        this.toastService.showToast('Email updated successfully', 'success');
        this.authServiceFields.email = response.data;
        this.localStorageService.setItem('email', response.data);
        this.disableEmail(true);
      },
      error: (error) => {
        this.toastService.showToast(
          `Failed to update username ${error}`,
          'danger'
        );
      },
    });
  }

  changePassword(): void {
    if (
      !this.changePaswordRequest.newPassword ||
      this.changePaswordRequest.newPassword !== this.confirmPassword
    ) {
      this.toastService.showToast('Passwords do not match', 'danger');
      return;
    }

    this.authService.changePassword(this.changePaswordRequest).subscribe({
      next: (response: AuthServiceResponse<string>) => {
        this.toastService.showToast('Password changed successfully', 'success');
      },
      error: (error) => {
        console.log({ error });
        this.toastService.showToast(error?.error?.message, 'danger');
      },
    });
  }

  deleteUser(): void {
    if (confirm('Are you sure you want to delete your account?')) {
      this.authService.deleteUser().subscribe({
        next: () => {
          this.localStorageService.clear();
          this.router.navigate(['/register']);
        },
        error: (error: any) => {
          this.handleError('Failed to delete user account.', error);
        },
      });
    }
  }

  //#endregion

  enablePasswordChange() {
    this.isPasswordChange = true;
  }

  getUserProfileDetails(): void {
    this.userService.getUserProfileDetails().subscribe({
      next: (response: UserServiceResponse<UserDto>) => {
        if (!response.success || !response.data) {
          this.toastService.showToast(response.message, 'danger');
          return;
        }
        this.userProfileDetails = response.data;
        this.updateUserRequest = response.data;
      },
      error: (error: any) => {
        this.toastService.showToast(error?.error?.message, 'danger');
      },
    });
  }

  updateUserDetails(): void {
    this.userService.updateUser(this.updateUserRequest).subscribe({
      next: (response: UserServiceResponse<UserDto>) => {
        if (!response.success || !response.data) {
          this.toastService.showToast(response.message, 'danger');
          return;
        }

        this.userProfileDetails = response.data;
        this.editProfileDetails = false;

        this.toastService.showToast(response.message, 'success');
      },
      error: (error: any) => {
        this.toastService.showToast(error?.error?.message, 'danger');
      },
    });
  }

  editProfileEdit(): void {
    this.editProfileDetails = true;
  }

  cancelEdit(): void {
    this.editProfileDetails = false;
    this.getUserProfileDetails();
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    this.toastService.showToast(message + ' ' + error, 'danger');
  }
}
