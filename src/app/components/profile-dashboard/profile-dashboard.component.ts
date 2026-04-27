import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-dashboard',
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.css'],
})
export class ProfileDashboardComponent {
  @ViewChild('sideMenu') sideMenu!: ElementRef;

  isMenuOpen: boolean = false;
  
  toggleMenuInDahBoard(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  currentSection: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private profileService: ProfileService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const childRoute = this.route.firstChild?.snapshot.routeConfig?.path;
        switch (childRoute) {
          case 'userinfo':
            this.currentSection = 'Your Information';
            break;
          case 'edit-user':
            this.currentSection = 'Edit Information';
            break;
          case 'orders':
            this.currentSection = 'My Orders';
            break;
          default:
            this.currentSection = 'Dashboard';
        }
      });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.router.navigate(['/signin']);
      },
    });
  }

  userInfoData: any;
  ngOnInit() {
    this.profileService.getUserInfo().subscribe({
      next: (userInfo) => {
        this.userInfoData = userInfo.user;
      },
      error: (err) => {
        console.error('Failed to load user info', err);
      },
    });
  }
}
