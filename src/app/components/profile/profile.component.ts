import {
  ChangePaswordRequest,
  InitializeChangePaswordRequest,
} from './../../models/auth.service.request.model';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserResponse } from '../../models/User.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
import { ToastService } from '../../services/toast.service';
import { AuthUser, InitializeAuthUser } from '../../models/auth.service.model';
import {
  ChangeUsernameRequest,
  InitializeChangeUsernameRequest,
  InitializeUpdateEmailRequest,
  UpdateEmailRequest,
} from '../../models/auth.service.request.model';
import { AuthServiceResponse } from '../../models/auth.service.response.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  isEditing = false;
  isPasswordReset = false;
  isPasswordChange = false;
  errorMessage = '';
  successMessage = '';
  resetToken = '';
  defaultProfilePicture =
    'https://th.bing.com/th/id/OIP.8lH9SOh2rz2dCyU_9zVJGgHaHV?w=181&h=180&c=7&r=0&o=5&pid=1.7';

  // Password reset fields
  confirmPassword = '';

  authFieldDisabled = {
    username: true,
    email: true,
    roles: true,
  };

  authServiceFields: AuthUser = InitializeAuthUser;

  changeUsernameRequest: ChangeUsernameRequest;
  updateEmailRequest: UpdateEmailRequest;
  changePaswordRequest: ChangePaswordRequest;

  constructor(
    // private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private toastService: ToastService
  ) {
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
  }

  ngOnInit(): void {
    // this.loadUserProfile();
  }

  /*
  loadUserProfile(): void {
    if (!this.username) return;

    this.userService.getUserByUsername(this.username).subscribe(
      (data: UserResponse) => {
        this.user = data;
        this.clearMessages();
      },
      (error: any) => {
        this.toastService.showToast(
          error.error?.message || 'Failed to load user profile',
          'danger'
        );
      }
    );
  }
*/
  enableEdit(): void {
    this.isEditing = true;
    this.isPasswordReset = false;
    this.clearMessages();
  }

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
    )
      return;

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

  enablePasswordChange(): void {
    this.isPasswordChange = true;
    this.isEditing = false;
    this.clearMessages();
    this.clearPasswordFields();
    this.changePassword();
  }
  /*
  saveChanges(): void {
    if (this.user && this.username) {
      const updatedData = {
        firstName: this.user.firstName,
        middleName: this.user.middleName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone,
        profilePicture: this.user.profilePicture || this.defaultProfilePicture,
        status: this.user.status,
      };

      this.userService.updateUser(this.username, updatedData).subscribe(
        () => {
          this.toastService.showToast(
            'Profile updated successfully!',
            'success'
          );
          this.isEditing = false;
          this.loadUserProfile();
        },
        (error) => {
          this.handleError('Failed to update user profile.', error);
        }
      );
    }
  }
*/
  /*
  resetPassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.showToast('Passwords do not match', 'warning');
      return;
    }

    const payload = {
      resetToken: this.resetToken,
      newPassword: this.newPassword,
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.toastService.showToast('Password reset successfully.', 'success');
        this.isPasswordReset = false;
        this.clearPasswordFields();
      },
      error: (error) => {
        this.handleError('Failed to reset password.', error);
      },
    });
  }
  
  cancelEdit(): void {
    this.isEditing = false;
    this.isPasswordReset = false;
    this.clearMessages();
    this.loadUserProfile();
  }
*/
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

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private clearPasswordFields(): void {
    this.confirmPassword = '';
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    this.toastService.showToast(message + ' ' + error, 'danger');
  }
}
