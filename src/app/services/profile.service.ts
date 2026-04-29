import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private baseUrl = `${environment.apiUrl}/userInfo/user`
    // 'https://e-commerce-back-end-khaki-two.vercel.app/api/userInfo/user';
  private ordersUrl = `${environment.apiUrl}/order`
    // 'https://e-commerce-back-end-khaki-two.vercel.app/api/order';

  constructor(private http: HttpClient) {}
  private getUserIdFromToken(): string {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const decoded: any = jwtDecode(token);
    return decoded.userId;
  }
  getUserInfo(): Observable<any> {
    const userId = this.getUserIdFromToken();
    return this.http.get(`${this.baseUrl}/${userId}`);
  }
  updateUser(data: any): Observable<any> {
    const userId = this.getUserIdFromToken();
    return this.http.put(`${this.baseUrl}/${userId}`, data);
  }
  getUserOrders() {
    return this.http.get(`${this.ordersUrl}/orders`);
  }
  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.ordersUrl}/${orderId}`);
  }
}
