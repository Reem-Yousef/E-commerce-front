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
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403 || (error.status === 404 && error.url?.includes('/userInfo/user/'))) {
          const errorMessage = error.error?.message || '';
          
          // Check if it's a user not found or auth issue
          if (
            errorMessage.toLowerCase().includes('user not found') || 
            errorMessage.toLowerCase().includes('invalid token') ||
            errorMessage.toLowerCase().includes('expired') ||
            error.status === 401 ||
            error.status === 403
          ) {
            console.warn('Authentication issue detected, clearing session:', errorMessage);
            localStorage.removeItem('token');
            this.router.navigate(['/signin']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
