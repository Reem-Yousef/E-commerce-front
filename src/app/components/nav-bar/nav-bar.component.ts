import { Component, HostListener, ViewChild, ElementRef, OnInit } from '@angular/core';
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
  
  @ViewChild('navbarToggler') navbarToggler!: ElementRef;
  @ViewChild('mainMenu') mainMenu!: ElementRef;
  
  isMenuOpen = false;

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

  // @HostListener('document:click', ['$event'])
  // onClickOutside(event: Event) {
  //   // التحقق من وجود العناصر
  //   if (!this.mainMenu || !this.navbarToggler) return;
    
  //   // إذا كان المنيو مفتوح
  //   if (this.isMenuOpen) {
  //     // تحقق إذا كان الضغط خارج المنيو وخارج الزر
  //     const clickedInsideMenu = this.mainMenu.nativeElement?.contains(event.target);
  //     const clickedOnToggler = this.navbarToggler.nativeElement?.contains(event.target);
      
  //     if (!clickedInsideMenu && !clickedOnToggler) {
  //       this.closeNavbar();
  //     }
  //   }
  // }
  @HostListener('document:click', ['$event'])
onClickOutside(event: Event) {
  // بنجيب العنصر اللي اتضغط عليه
  const clickedElement = event.target as HTMLElement;

  // بنشيك لو المنيو مفتوح والضغطة حصلت "بره" الـ Component بتاعنا بالكامل
  // this.el.nativeElement هو الـ container بتاع الـ NavBar كله
  if (this.isMenuOpen && !this.el.nativeElement.contains(clickedElement)) {
    this.closeNavbar();
  }
}


  toggleNavbar() {
    this.isMenuOpen = !this.isMenuOpen;
    
    if (this.mainMenu && this.mainMenu.nativeElement) {
      if (this.isMenuOpen) {
        this.mainMenu.nativeElement.classList.add('show');
      } else {
        this.mainMenu.nativeElement.classList.remove('show');
      }
    }
  }

  closeNavbar() {
    this.isMenuOpen = false;
    
    if (this.mainMenu && this.mainMenu.nativeElement) {
      this.mainMenu.nativeElement.classList.remove('show');
    }
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.userInfoData = null;
        this.closeNavbar(); 
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.userInfoData = null;
        this.closeNavbar();
        this.router.navigate(['/signin']);
      },
    });
  }
}

