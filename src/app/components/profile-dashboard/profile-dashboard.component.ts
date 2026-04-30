import { Component, ElementRef, ViewChild,HostListener } from '@angular/core';
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
@ViewChild('toggler') toggler!: ElementRef; 

  isMenuOpen: boolean = false;
  

  currentSection: string = '';

  constructor(
    private el: ElementRef,
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

@HostListener('document:click', ['$event'])
onClickOutside(event: Event) {
  if (!this.isMenuOpen) return; // لو مقفول متعملش حاجة

  const clickedElement = event.target as HTMLElement;

  // التحقق: هل الضغطة كانت جوه السايد بار نفسه؟
  const clickedInsideSidebar = this.sideMenu.nativeElement.contains(clickedElement);
  
  // التحقق: هل الضغطة كانت على الزرار اللي بيفتح؟
  const clickedOnToggler = this.toggler.nativeElement.contains(clickedElement);

  // لو الضغطة مش جوه السايد بار ومش على الزرار.. اقفل
  if (!clickedInsideSidebar && !clickedOnToggler) {
    this.isMenuOpen = false;
  }
  }

  toggleMenuInDahBoard(): void {
    this.isMenuOpen = !this.isMenuOpen;
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
