import { Injectable } from '@angular/core';

export interface SelectedProduct {
  id: string;
  name: string;
  price: number;
  status: string;
  inProperty: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private storageKey = 'checkout_data';

 settings(selectedProducts: SelectedProduct[], subtotal: number = 0, total: number = 0): void {
  const data = {
    items: selectedProducts,
    subtotal,
    total
  };
  localStorage.setItem(this.storageKey, JSON.stringify(data));
}


  getItems(): SelectedProduct[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored).items || [] : [];
  }

  getSubtotal(): number {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored).subtotal || 0 : 0;
  }

  getTotal(): number {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored).total || 0 : 0;
  }

  clearItems(): void {
    localStorage.removeItem(this.storageKey);
  }
}
