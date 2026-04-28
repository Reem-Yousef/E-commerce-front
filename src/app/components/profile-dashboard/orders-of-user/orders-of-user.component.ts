import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';

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
  deliveryStatus: string;
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
    this.loadOrders();
  }
  loadOrders(): void {
    this.orderService.getUserOrders().subscribe({
      next: (res: any) => {
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

  deleteOrder(orderId: string): void {
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.orderService.deleteOrder(orderId).subscribe({
            next: () => {
              Swal.default.fire('Deleted!', 'Your order has been deleted.', 'success');
              this.loadOrders();
            },
            error: (err) => {
              Swal.default.fire('Error!', 'Failed to delete order.', 'error');
              console.error(err);
            }
          });
        }
      });
    });
  }
}
