import { Component } from '@angular/core';
import {
  ForgotPasswordRequest,
  InitializeForgotPasswordRequest,
} from '../../models/auth.service.request.model';
import { AuthService } from '../../services/auth.service';
import { AuthServiceResponse } from '../../models/auth.service.response.model';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  forgotPasswordRequest: ForgotPasswordRequest;

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.forgotPasswordRequest = InitializeForgotPasswordRequest;
  }

  forgotPassword(): void {
    if (!this.forgotPasswordRequest.email) return;
    this.authService.forgotPassword(this.forgotPasswordRequest).subscribe({
      next: (response: AuthServiceResponse<string>) => {
        if (!response.success) return;
        this.toastService.showToast(response.message, 'success');
      },
      error: (error: any) => {
        this.toastService.showToast(error?.error?.message, 'danger');
      },
    });
  }
}
