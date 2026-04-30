import { Component, ElementRef, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent implements OnInit {
  userInfoData: any;

  constructor(
    private el: ElementRef,
    public authService: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadUserInfo();
    }
  }

  loadUserInfo() {
    this.profileService.getUserInfo().subscribe({
      next: (res) => {
        this.userInfoData = res.user;
      },
      error: (err) => {
        console.error('Failed to load user info for navbar', err);
      },
    });
  }

isProfilePage(): boolean {
  return this.router.url.includes('/dashboard') || 
         this.router.url.includes('/profile') ||
         this.router.url === '/dashboard';
}
  closeNavbar() {
    const navbar = this.el.nativeElement.querySelector('#mainMenu');
    if (navbar.classList.contains('show')) {
      navbar.classList.remove('show');
    }
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.userInfoData = null;
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.userInfoData = null;
        this.router.navigate(['/signin']);
      },
    });
  }
}
