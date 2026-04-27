import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../services/porpfile.service';

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  description: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  orderedAt: Date;
  status: string;
}

@Component({
  selector: 'app-orders-of-user',
  templateUrl: './orders-of-user.component.html',
  styleUrls: ['./orders-of-user.component.css'],
})
export class OrdersOfUserComponent implements OnInit {
  orders: Order[] = [];
  isLoading: boolean = true;
  error: string = '';

  constructor(private orderService: ProfileService) {}

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe({
      next: (res: any) => {
        console.log('User Orders Response:', res);

        // ✅ هنا التعديل الأساسي
        // لو الباك بيرجع object زي { orders: [...] }
        if (res && Array.isArray(res)) {
          this.orders = res;
        } else if (res && Array.isArray(res.orders)) {
          this.orders = res.orders;
        } else {
          this.orders = [];
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders';
        this.isLoading = false;
        console.error(err);
      },
    });
  }
}
