import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, SelectedProduct } from '../../services/order.service';
import { environment } from '../../enviroments/enviroment';
import { loadStripe } from '@stripe/stripe-js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { countries } from '../../shared/countries';

interface OrderItemPayload {
  product: string;
  quantity: number;
  price: number;
}

interface StripeSessionResponse {
  url: string;
  sessionId: string;
}

interface OrderPayload {
  items: OrderItemPayload[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phoneNumbers: string[];
  totalAmount: number;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  items: SelectedProduct[] = [];
  shipping = 0;
  isProcessingStripe = false;
  isProcessingOrder = false;
  couponCode = '';
  showCouponInput = false;
  discount = 0;
  errorMessage = '';
  countries = countries;

  billing = {
    firstName: '',
    lastName: '',
    companyName: '',
    country: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    notes: ''
  };

  stripePromise = loadStripe('pk_test_51RUT2vQ1mOUKBBPX1rhmLdVi1yZjFHuWzVq940WcgLBRqS22jcKvZghZLg4zuwtTZqnBR5CukvhOp4LDn2zsZOfI00zJAgkyjJ');

  constructor(
    private http: HttpClient,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.items = this.orderService.getItems();
    if (this.items.length === 0) {
      this.router.navigate(['/products'], {
        state: { message: 'Your cart is empty' }
      });
    }
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get total(): number {
    return Math.round((this.subtotal * (1 - this.discount / 100) + this.shipping) * 100) / 100;
  }

  get allProductsAvailable(): boolean {
    return this.items.every((item) => item.status === 'Available');
  }

  toggleCouponInput(): void {
    this.showCouponInput = !this.showCouponInput;
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.errorMessage = 'Please enter a valid coupon code.';
      return;
    }
    this.discount = 10;
    this.showCouponInput = false;
    this.couponCode = '';
    this.errorMessage = '';
  }

  private validateFormData(): boolean {
    const requiredFields = [
      'firstName', 'lastName', 'country', 'streetAddress', 
      'city', 'state', 'zip', 'phone', 'email'
    ];

    for (const field of requiredFields) {
      if (!this.billing[field as keyof typeof this.billing]?.trim()) {
        this.errorMessage = `${field} is required`;
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.billing.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    const phoneRegex = /^\+?\d{7,15}$/;
    if (!phoneRegex.test(this.billing.phone.replace(/[\s\-\(\)]/g, ''))) {
      this.errorMessage = 'Please enter a valid phone number (7-15 digits)';
      return false;
    }

    return true;
  }

  private createOrderPayload(): OrderPayload {
    return {
      items: this.items.map(item => ({
        product: String(item.id),
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        address: this.billing.streetAddress,
        city: this.billing.city,
        postalCode: this.billing.zip,
        country: this.billing.country
      },
      phoneNumbers: [this.billing.phone.replace(/[\s\-\(\)]/g, '')],
      totalAmount: this.total
    };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token || '',
      'Content-Type': 'application/json'
    });
  }

  processPaymentWithValidation(form: NgForm): void {
    if (form.invalid) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Form Invalid', 
        text: 'Please fill all required fields correctly.' 
      });
      Object.keys(form.controls).forEach((field) => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.processPayment();
  }

  validateAndProceed(form: NgForm): void {
    if (form.invalid) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Form Invalid', 
        text: 'Please fill all required fields correctly.' 
      });
      Object.keys(form.controls).forEach((field) => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return;
    }

    if (!this.validateFormData()) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Validation Error', 
        text: this.errorMessage 
      });
      return;
    }

    const orderPayload = this.createOrderPayload();
    const headers = this.getAuthHeaders();
    this.isProcessingOrder = true;
    this.errorMessage = '';

    this.http.post(`${environment.apiUrl}/order/checkout`, orderPayload, { headers }).subscribe({
      next: (res: any) => {
        Swal.fire({ 
          icon: 'success', 
          title: '✅ Order Placed Successfully', 
          text: res.message || 'Your order has been placed!' 
        });
        this.orderService.clearItems();
        this.router.navigate(['/dashboard/orders']);
      },
      error: (err) => {
        console.error('Order error:', err);
        Swal.fire({ 
          icon: 'error', 
          title: '❌ Order Failed', 
          text: err?.error?.message || 'Something went wrong.' 
        });
      },
      complete: () => {
        this.isProcessingOrder = false;
      }
    });
  }

  async processPayment(): Promise<void> {
    if (!this.validateFormData()) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Form Validation Error', 
        text: this.errorMessage 
      });
      return;
    }

    if (!this.allProductsAvailable) {
      this.errorMessage = 'Some items in your cart are not available';
      Swal.fire({ 
        icon: 'error', 
        title: 'Items Unavailable', 
        text: this.errorMessage 
      });
      return;
    }

    this.isProcessingStripe = true;
    this.errorMessage = '';
    const stripe = await this.stripePromise;

    if (!stripe) {
      this.isProcessingStripe = false;
      Swal.fire({ 
        icon: 'error', 
        title: 'Payment Error', 
        text: 'Payment system failed to load. Please try again.' 
      });
      return;
    }

    try {
      const orderPayload = this.createOrderPayload();
      const headers = this.getAuthHeaders();
      const session = await lastValueFrom(
        this.http.post<StripeSessionResponse>(
          `${environment.apiUrl}/order/create-checkout-session`,
          orderPayload,
          { headers }
        )
      );

      if (session?.url) {
        this.orderService.clearItems();
        window.location.href = session.url;
      } else {
        throw new Error('Failed to create Stripe session - no URL returned');
      }
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err.message || 'An error occurred during checkout';
      Swal.fire({ 
        icon: 'error', 
        title: 'Payment Error', 
        text: this.errorMessage 
      });
    } finally {
      this.isProcessingStripe = false;
    }
  }
}
