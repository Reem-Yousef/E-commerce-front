import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../services/wishlist.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit {
  wishlist: any[] = [];
  loading = false;

  constructor(
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  navigateToProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  loadWishlist() {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.wishlist = res.products;
        this.loading = false;
        // Update the wishlist service state
        this.wishlistService.loadWishlistItems();
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
        this.loading = false;
      },
    });
  }

  removeItem(productId: string) {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        // Update local state immediately for better UX
        this.wishlist = this.wishlist.filter(item => item.product._id !== productId);
        // Update the service state so heart icons update elsewhere
        this.wishlistService.updateWishlistState(productId, false);
      },
      error: (err) => {
        console.error('Remove failed', err);
        this.loadWishlist();
      },
    });
  }
}