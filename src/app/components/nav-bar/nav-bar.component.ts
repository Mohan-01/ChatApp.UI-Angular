import { LocalStorageService } from './../../services/local-storage.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SearchUsersComponent } from '../search-users/search-users.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SearchUsersComponent],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  showMobileMenu = false;
  username: string | null = null;
  isAuthenticated: boolean = false;
  private authStatusSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.localStorageService.getUsername();

    // Subscribe to the authentication status observable
    this.authStatusSubscription = this.authService.isAuthenticated$.subscribe(
      (status) => {
        this.isAuthenticated = status;
      }
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.authStatusSubscription) {
      this.authStatusSubscription.unsubscribe();
    }
  }

  // Logout the user
  logout(): void {
    this.authService.logout().subscribe(() => {
      console.log({ logoutAuth: this.isAuthenticated });
      this.router.navigate(['/home']);
    });
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
