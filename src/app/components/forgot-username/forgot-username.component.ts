import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ForgotUsernameRequest,
  InitializeForgotPasswordRequest,
} from '../../models/auth.service.request.model';
import { AuthServiceResponse } from '../../models/auth.service.response.model';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-username',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-username.component.html',
  styleUrl: './forgot-username.component.css',
})
export class ForgotUsernameComponent {
  forgotUsernameRequest: ForgotUsernameRequest;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.forgotUsernameRequest = InitializeForgotPasswordRequest;
  }
  forgotUsername(): void {
    this.authService.forgotUsername(this.forgotUsernameRequest).subscribe({
      next: (response: AuthServiceResponse<string>) => {
        this.toastService.showToast(response.message, 'success');
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.toastService.showToast(error?.error?.message, 'danger');
      },
    });
  }
}
