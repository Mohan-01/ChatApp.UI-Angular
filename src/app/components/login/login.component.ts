import {
  ForgotPasswordRequest,
  ForgotUsernameRequest,
  InitializeForgotPasswordRequest,
} from '../../models/auth-service/auth.service.request.model';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { LocalStorageService } from '../../services/local-storage.service';
import {
  InitializeLoginRequest,
  LoginRequest,
} from '../../models/auth-service/auth.service.request.model';
import {
  AuthResponse,
  AuthServiceResponse,
} from '../../models/auth-service/auth.service.response.model';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent implements OnInit {
  isLoading: boolean = false;
  errorMessage: string = '';

  loginRequest: LoginRequest;

  constructor(
    private authService: AuthService,
    private router: Router, // private msalService: MsalService
    private toastService: ToastService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute
  ) {
    this.loginRequest = InitializeLoginRequest;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl); // ✅ redirect back to the intended route
      }
    });
  }

  login(): void {
    this.authService
      .login({
        username: this.loginRequest.username,
        password: this.loginRequest.password,
      })
      .subscribe({
        next: (response: AuthServiceResponse<AuthResponse>) => {
          this.localStorageService.setUsername(response.data.username);
          this.localStorageService.setItem('email', response.data.email);
          this.toastService.showToast('Login successful', 'success', 3000);
          this.router.navigate(['/home']); // Redirect to the chat interface
        },
        error: (error: any) => {
          console.log({ error });
          this.toastService.showToast(
            `Login failed ${error.error.message}`,
            'danger',
            3000
          );
        },
      });
  }
}
