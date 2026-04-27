import { AfterViewInit, Component } from '@angular/core';
import * as AOS from 'aos';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    AOS.init();
  }

  user = {
    username: '',
    email: '',
    password: '',
    phoneNumbers: [''],
    addresses: [''],
    age: null,
  };
  confirmPassword: string = '';

  constructor(private authService: AuthService, private router: Router) {}
  errorMsg: string = '';
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  register() {
    this.errorMsg = '';

    // 1. Name Validation
    if (this.user.username.trim().length < 3) {
      this.errorMsg = 'Name must be at least 3 characters long';
      return;
    }

    // 2. Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.user.email)) {
      this.errorMsg = 'Please enter a valid email address (e.g., user@example.com)';
      return;
    }

    // 3. Password Validation (Min 8 chars)
    if (this.user.password.length < 8) {
      this.errorMsg = 'Password must be at least 8 characters long';
      return;
    }

    // 4. Password Confirmation
    if (this.user.password !== this.confirmPassword) {
      this.errorMsg = "Passwords don't match";
      return;
    }

    // 5. Phone Validation (Numbers only, 11 digits for Egyptian format)
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(this.user.phoneNumbers[0])) {
      this.errorMsg = 'Please enter a valid Egyptian phone number (e.g., 01012345678)';
      return;
    }

    // 6. Age Validation (Already handled by min/max in HTML, but safe to check here)
    if (!this.user.age || this.user.age < 18 || this.user.age > 100) {
      this.errorMsg = 'Age must be between 18 and 100';
      return;
    }

    // 7. Address Validation
    if (this.user.addresses[0].trim().length < 5) {
      this.errorMsg = 'Please enter a complete address';
      return;
    }
    this.authService.register(this.user).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          showConfirmButton: false,
          timer: 2000,
        });
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        console.log(err);

        const errorMessage =
          err.error?.errors?.[0] ||
          err.error?.message ||
          'Registration failed. Please try again.';
        Swal.fire({
          icon: 'error',
          title: 'An Error Occurred',
          text: errorMessage,
        });
      },
    });
  }
}