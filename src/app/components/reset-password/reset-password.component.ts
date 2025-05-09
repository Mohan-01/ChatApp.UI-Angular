import { ToastService } from './../../services/toast.service';
import { Component, OnInit } from '@angular/core';
import {
  InitializeResetPasswordRequest,
  ResetPasswordRequest,
} from '../../models/auth-service/auth.service.request.model';
import { AuthService } from '../../services/auth.service';
import { AuthServiceResponse } from '../../models/auth-service/auth.service.response.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  confirmPassword: string = '';
  resetPasswordRequest: ResetPasswordRequest;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetPasswordRequest = InitializeResetPasswordRequest;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.resetPasswordRequest.resetToken = params['reset-token'];
      console.log(
        'Received reset token:',
        this.resetPasswordRequest.resetToken
      );

      if (!this.resetPasswordRequest.resetToken) {
        console.error('No reset token found!');
        this.router.navigate(['/login']);
      }
    });
  }

  resetPassword(): void {
    if (
      !this.resetPasswordRequest.resetToken ||
      !this.resetPasswordRequest.newPassword
    )
      return;
    this.authService.resetPassword(this.resetPasswordRequest).subscribe({
      next: (response: AuthServiceResponse<string>) => {
        this.toastService.showToast(
          response.message + ' Redirecting to Login Page',
          'success',
          3000
        );
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.toastService.showToast(error?.error?.message, 'danger');
      },
    });
  }
}
