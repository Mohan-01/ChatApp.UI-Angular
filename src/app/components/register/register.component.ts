import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import {
  InitializeRegisterRequest,
  RegisterRequest,
} from '../../models/auth.service.request.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerRequest: RegisterRequest;

  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerRequest = InitializeRegisterRequest;
  }

  ngOnInit(): void {
    this.registerRequest = InitializeRegisterRequest;
  }

  signup(): void {
    this.authService.register(this.registerRequest).subscribe(
      () => {
        this.successMessage =
          'Account created successfully. Redirecting to login...';
        this.toastService.showToast(this.successMessage, 'success');
        setTimeout(() => {
          this.router.navigate(['/login']); // Redirect to login page
        }, 3000);
      },
      (error) => {
        this.errorMessage =
          error.error.message || 'An error occurred during signup.';
        this.toastService.showToast(this.errorMessage, 'danger');
      }
    );
  }
}
