import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');
    
    // Inject token if it exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: token
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized or 403 Forbidden
        if (error.status === 401 || error.status === 403) {
          const errorMessage = error.error?.message || '';
          console.warn('Authentication issue detected, clearing session:', errorMessage);
          
          localStorage.removeItem('token');
          // Only redirect to signin if we are not already there
          if (!this.router.url.includes('/signin')) {
            this.router.navigate(['/signin']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
