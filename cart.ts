<<<<<<< HEAD
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable, map } from 'rxjs';
import { Master } from './master';
import { Auth } from '../../shared/services/auth';
import { CartItem } from '../interfaces/cart';
import { ShippingMethod } from '../interfaces/shipping';
import { IProductSpecification } from '../interfaces/product';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private shippingService = inject(Master);

  // Configuration
  private readonly CART_KEY = 'ecom_cart';
  private readonly API_URL = `${environment.apiUrl}/cart`;

  // Subjects
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  private shippingMethodsSubject = new BehaviorSubject<ShippingMethod[]>([]);
  public shippingMethods$ = this.shippingMethodsSubject.asObservable();

  private selectedMethodIdSubject = new BehaviorSubject<number | null>(null);
  public selectedMethodId$ = this.selectedMethodIdSubject.asObservable();

  constructor() {
    this.initCart();
    this.fetchShippingMethods();
  }

  /**
   * Initialization: Determines whether to pull from Cloud or Local
   */
  public initCart(): void {
    if (this.authService.getAuthenticatedUser()) {
      this.loadCartFromApi();
    } else {
      this.loadCartFromLocalStorage();
    }
  }

  private loadCartFromLocalStorage(): void {
    const items = localStorage.getItem(this.CART_KEY);
    if (items) {
      try {
        this.cartItemsSubject.next(JSON.parse(items));
      } catch (e) {
        console.error('Failed to parse local cart data', e);
        this.cartItemsSubject.next([]);
      }
    }
  }

  private loadCartFromApi(): void {
    this.http.get<CartItem[]>(this.API_URL).subscribe({
      next: (items) => this.cartItemsSubject.next(items),
      error: (err) => {
        console.error('Daz Cloud Cart Sync Error:', err);
        this.loadCartFromLocalStorage(); // Fallback to local if API fails
      }
    });
  }

  /**
   * Persistence: Saves state to the correct destination
   */
  private persistChanges(items: CartItem[]): void {
    this.cartItemsSubject.next(items);

    if (this.authService.getAuthenticatedUser()) {
      // Sync with Daz Electronics Database
      this.http.post(this.API_URL, { items }).subscribe();
    } else {
      // Save to Browser LocalStorage
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    }
  }

  /**
   * Cart Actions
   */
  addItem(product: IProductSpecification, quantity: number, color: string, size: string): void {
    const currentItems = [...this.cartItemsSubject.value];
    const index = currentItems.findIndex(
      i => i.product.id === product.id && i.selectedColor === color && i.selectedSize === size
    );

    if (index > -1) {
      currentItems[index] = {
        ...currentItems[index],
        quantity: currentItems[index].quantity + quantity
      };
    } else {
      const newItem: CartItem = {
        id: Date.now(), // Client-side ID, backend will map to primary key
        product: product,
        quantity: quantity,
        selectedColor: color,
        selectedSize: size
      };
      currentItems.push(newItem);
    }

    this.persistChanges(currentItems);
  }

  removeItem(itemId: number): void {
    const items = this.cartItemsSubject.value.filter(i => i.id !== itemId);
    this.persistChanges(items);
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    const items = [...this.cartItemsSubject.value];
    const item = items.find(i => i.id === itemId);

    if (item) {
      item.quantity = newQuantity > 0 ? newQuantity : 1;
      this.persistChanges(items);
    }
  }

  clearAllItems(): void {
    this.persistChanges([]);
  }

  /**
   * Shipping Logic
   */
  private fetchShippingMethods(): void {
    this.shippingService.getAvailableMethods().subscribe(methods => {
      this.shippingMethodsSubject.next(methods);

      if (methods.length > 0 && this.selectedMethodIdSubject.value === null) {
        const cheapest = methods.reduce((prev, curr) =>
          parseFloat(prev.base_cost) < parseFloat(curr.base_cost) ? prev : curr
        );
        this.setSelectedMethod(cheapest.id);
      }
    });
  }

  setSelectedMethod(methodId: number): void {
    this.selectedMethodIdSubject.next(methodId);
  }

  /**
   * Financial Observables (Reactive)
   */
  subtotal$: Observable<number> = this.cartItems$.pipe(
    map(items => items.reduce((total, item) => {
      const price = parseFloat(item.product.discounted_price);
      return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0))
  );

  tax$: Observable<number> = this.subtotal$.pipe(
    map(subtotal => parseFloat((subtotal * 0.05).toFixed(2))) // Adjusted to 5% for technical services
  );

  shippingCost$: Observable<number> = combineLatest([
    this.subtotal$,
    this.selectedMethodId$,
    this.shippingMethods$
  ]).pipe(
    map(([subtotal, selectedId, methods]) => {
      const selectedMethod = methods.find(m => m.id === selectedId);
      if (!selectedMethod) return 0;

      const baseCost = parseFloat(selectedMethod.base_cost);
      const threshold = parseFloat(selectedMethod.free_shipping_threshold);

      return subtotal >= threshold ? 0 : baseCost;
    })
  );

  total$: Observable<number> = combineLatest([
    this.subtotal$,
    this.tax$,
    this.shippingCost$
  ]).pipe(
    map(([subtotal, tax, shipping]) => subtotal + tax + shipping)
  );

  /**
   * Synchronous Getters (for template immediate access)
   */
  get subtotalValue(): number {
    return this.cartItemsSubject.value.reduce((total, item) => {
      const price = parseFloat(item.product.discounted_price);
      return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);
  }
}
=======
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable, map } from 'rxjs';
import { Master } from './master';
import { Auth } from '../../shared/services/auth';
import { CartItem } from '../interfaces/cart';
import { ShippingMethod } from '../interfaces/shipping';
import { IProductSpecification } from '../interfaces/product';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private shippingService = inject(Master);

  // Configuration
  private readonly CART_KEY = 'ecom_cart';
  private readonly API_URL = `${environment.apiUrl}/cart`;

  // Subjects
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  private shippingMethodsSubject = new BehaviorSubject<ShippingMethod[]>([]);
  public shippingMethods$ = this.shippingMethodsSubject.asObservable();

  private selectedMethodIdSubject = new BehaviorSubject<number | null>(null);
  public selectedMethodId$ = this.selectedMethodIdSubject.asObservable();

  constructor() {
    this.initCart();
    this.fetchShippingMethods();
  }

  /**
   * Initialization: Determines whether to pull from Cloud or Local
   */
  public initCart(): void {
    if (this.authService.getAuthenticatedUser()) {
      this.loadCartFromApi();
    } else {
      this.loadCartFromLocalStorage();
    }
  }

  private loadCartFromLocalStorage(): void {
    const items = localStorage.getItem(this.CART_KEY);
    if (items) {
      try {
        this.cartItemsSubject.next(JSON.parse(items));
      } catch (e) {
        console.error('Failed to parse local cart data', e);
        this.cartItemsSubject.next([]);
      }
    }
  }

  private loadCartFromApi(): void {
    this.http.get<CartItem[]>(this.API_URL).subscribe({
      next: (items) => this.cartItemsSubject.next(items),
      error: (err) => {
        console.error('Daz Cloud Cart Sync Error:', err);
        this.loadCartFromLocalStorage(); // Fallback to local if API fails
      }
    });
  }

  /**
   * Persistence: Saves state to the correct destination
   */
  private persistChanges(items: CartItem[]): void {
    this.cartItemsSubject.next(items);

    if (this.authService.getAuthenticatedUser()) {
      // Sync with Daz Electronics Database
      this.http.post(this.API_URL, { items }).subscribe();
    } else {
      // Save to Browser LocalStorage
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    }
  }

  /**
   * Cart Actions
   */
  addItem(product: IProductSpecification, quantity: number, color: string, size: string): void {
    const currentItems = [...this.cartItemsSubject.value];
    const index = currentItems.findIndex(
      i => i.product.id === product.id && i.selectedColor === color && i.selectedSize === size
    );

    if (index > -1) {
      currentItems[index] = {
        ...currentItems[index],
        quantity: currentItems[index].quantity + quantity
      };
    } else {
      const newItem: CartItem = {
        id: Date.now(), // Client-side ID, backend will map to primary key
        product: product,
        quantity: quantity,
        selectedColor: color,
        selectedSize: size
      };
      currentItems.push(newItem);
    }

    this.persistChanges(currentItems);
  }

  removeItem(itemId: number): void {
    const items = this.cartItemsSubject.value.filter(i => i.id !== itemId);
    this.persistChanges(items);
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    const items = [...this.cartItemsSubject.value];
    const item = items.find(i => i.id === itemId);

    if (item) {
      item.quantity = newQuantity > 0 ? newQuantity : 1;
      this.persistChanges(items);
    }
  }

  clearAllItems(): void {
    this.persistChanges([]);
  }

  /**
   * Shipping Logic
   */
  private fetchShippingMethods(): void {
    this.shippingService.getAvailableMethods().subscribe(methods => {
      this.shippingMethodsSubject.next(methods);

      if (methods.length > 0 && this.selectedMethodIdSubject.value === null) {
        const cheapest = methods.reduce((prev, curr) =>
          parseFloat(prev.base_cost) < parseFloat(curr.base_cost) ? prev : curr
        );
        this.setSelectedMethod(cheapest.id);
      }
    });
  }

  setSelectedMethod(methodId: number): void {
    this.selectedMethodIdSubject.next(methodId);
  }

  /**
   * Financial Observables (Reactive)
   */
  subtotal$: Observable<number> = this.cartItems$.pipe(
    map(items => items.reduce((total, item) => {
      const price = parseFloat(item.product.discounted_price);
      return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0))
  );

  tax$: Observable<number> = this.subtotal$.pipe(
    map(subtotal => parseFloat((subtotal * 0.05).toFixed(2))) // Adjusted to 5% for technical services
  );

  shippingCost$: Observable<number> = combineLatest([
    this.subtotal$,
    this.selectedMethodId$,
    this.shippingMethods$
  ]).pipe(
    map(([subtotal, selectedId, methods]) => {
      const selectedMethod = methods.find(m => m.id === selectedId);
      if (!selectedMethod) return 0;

      const baseCost = parseFloat(selectedMethod.base_cost);
      const threshold = parseFloat(selectedMethod.free_shipping_threshold);

      return subtotal >= threshold ? 0 : baseCost;
    })
  );

  total$: Observable<number> = combineLatest([
    this.subtotal$,
    this.tax$,
    this.shippingCost$
  ]).pipe(
    map(([subtotal, tax, shipping]) => subtotal + tax + shipping)
  );

  /**
   * Synchronous Getters (for template immediate access)
   */
  get subtotalValue(): number {
    return this.cartItemsSubject.value.reduce((total, item) => {
      const price = parseFloat(item.product.discounted_price);
      return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);
  }
}
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
