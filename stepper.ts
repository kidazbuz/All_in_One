import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid'; // Assuming you'd use a UUID library for local IDs
import { firstValueFrom } from 'rxjs';
import { Data } from './data';
import { LineItem, SaleTransactionPayload, SaleResponse, ProductSpec } from './sales-data';


interface ProductSpecification {
  id: number;
  name: string;
  sku: string;
  unit_price: string;
  unit_measure: string;
}

interface CartItem {
  product_specification_id: number;
  quantity: number;
  unit_price: string;
  unit_measure: string;
  // UI fields
  name: string;
  sku: string;
  subtotal: number;
}

interface CustomerData {
  // Fields for new customer creation (simplified)
  firstName: string;
  lastName: string;
  phone: string;
}


@Component({
  selector: 'app-sales',
  standalone: false,
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
})
export class Sales implements OnInit{

  // --- State Management ---
  currentStage = signal(1); // 1: Customer, 2: Sales/Items, 3: Payment, 4: Preview
  stages = ['Customer Details', 'Add Items', 'Payment', 'Review & Complete'];

  // Data signals
  cartItems = signal<CartItem[]>([]);

  // Optional customer details
  newCustomerId = signal<string | null>(null); // UUID for a newly created customer
  existingCustomerId = signal<string | null>(null); // UUID for an existing customer

  // Mock data for autocomplete (In a real app, this would come from an API)
  mockProducts: ProductSpecification[] = [
    { id: 101, name: 'A4 Printer Paper', sku: 'PPR-A4', unit_price: '0.05', unit_measure: 'sheet' },
    { id: 102, name: 'Black Ink Cartridge', sku: 'INK-BLK', unit_price: '25.99', unit_measure: 'unit' },
    { id: 103, name: 'Stapler', sku: 'STP-MD', unit_price: '5.50', unit_measure: 'unit' },
  ];

  // --- Form Groups ---
  customerForm!: FormGroup;
  salesForm!: FormGroup; // Used only for item search/add
  paymentForm!: FormGroup;

  // --- Computed Values ---
  subTotal = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.subtotal, 0)
  );

  totalItems = computed(() => this.cartItems().length);

  // --- Autocomplete ---
  autocompleteResults: ProductSpecification[] = [];

  // --- Constructor ---
  constructor(private fb: FormBuilder, private http: HttpClient) {} // HttpClient for potential API calls

  ngOnInit(): void {
    this.initializeForms();
    this.setupAutocomplete();
  }

  initializeForms(): void {
    this.customerForm = this.fb.group({
      firstName: ['', Validators.minLength(2)],
      lastName: ['', Validators.minLength(2)],
      phone: ['', [Validators.minLength(8), Validators.maxLength(15)]],
    });

    this.salesForm = this.fb.group({
      searchQuery: new FormControl('', Validators.required),
      quantity: [1, [Validators.required, Validators.min(1)]]
    });

    this.paymentForm = this.fb.group({
      sales_outlet: [null, [Validators.required, Validators.min(1)]],
      payment_method: ['CARD', Validators.required],
      payment_status: ['Completed', Validators.required],
    });
  }

  // --- Stage 1: Customer Details ---

  submitNewCustomer(): void {
    if (this.customerForm.valid && this.customerForm.get('firstName')?.value) {
      // 1. Mock API call to create customer (in a real app)
      console.log('Creating new customer:', this.customerForm.value);
      // 2. Simulate customer creation success and get ID
      this.newCustomerId.set(uuidv4());

      this.nextStage();
    } else {
      // Mark all controls as touched to show errors
      this.customerForm.markAllAsTouched();
    }
  }

  skipCustomer(): void {
    // Clear any pending customer data and move on
    this.newCustomerId.set(null);
    this.existingCustomerId.set(null);
    this.nextStage();
  }

  // --- Stage 2: Sales/Items ---

  setupAutocomplete(): void {
    this.salesForm.get('searchQuery')?.valueChanges
      .pipe(
        debounceTime(300),
        // Use a mock search function for local data
        switchMap(query => this.mockSearchProducts(query))
      )
      .subscribe(results => {
        this.autocompleteResults = results;
      });
  }

  mockSearchProducts(query: string): Observable<ProductSpecification[]> {
    if (!query) return of([]);
    const lowerQuery = query.toLowerCase();
    const results = this.mockProducts.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery)
    );
    return of(results);
  }

  // Action from autocomplete dropdown
  selectProduct(product: ProductSpecification): void {
    const quantity = this.salesForm.get('quantity')?.value || 1;
    this.addItemToCart(product, quantity);

    // Reset the sales form fields
    this.salesForm.reset({ searchQuery: '', quantity: 1 });
    this.autocompleteResults = [];
  }

  addItemToCart(product: ProductSpecification, quantity: number): void {
    if (quantity < 1) return;

    const unitPrice = parseFloat(product.unit_price);
    const newItem: CartItem = {
      product_specification_id: product.id,
      quantity: quantity,
      unit_price: product.unit_price,
      unit_measure: product.unit_measure,
      name: product.name,
      sku: product.sku,
      subtotal: quantity * unitPrice
    };

    this.cartItems.update(items => [...items, newItem]);
  }

  updateItemQuantity(index: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newQuantity = parseInt(inputElement.value, 10);

    if (newQuantity < 1) return;

    this.cartItems.update(items => {
      const updatedItems = [...items];
      const item = updatedItems[index];
      const unitPrice = parseFloat(item.unit_price);

      item.quantity = newQuantity;
      item.subtotal = newQuantity * unitPrice;

      return updatedItems;
    });
  }

  removeItem(index: number): void {
    this.cartItems.update(items =>
      items.filter((_, i) => i !== index)
    );
  }

  // --- Stage 3: Payment Details ---

  // Handled by nextStage() after form validation

  // --- Stage 4: Preview & Complete ---

  buildPayload(): any {
    const paymentData = this.paymentForm.value;
    const itemsPayload = this.cartItems().map(item => ({
      product_specification_id: item.product_specification_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit_measure: item.unit_measure,
    }));

    return {
      // Use newCustomerId if present, otherwise use existing or a default if required by API
      customer_id: this.newCustomerId() || this.existingCustomerId() || uuidv4(),
      sales_outlet: paymentData.sales_outlet,
      payment_method: paymentData.payment_method,
      payment_status: paymentData.payment_status,
      items: itemsPayload
    };
  }

  completeSale(): void {
    const payload = this.buildPayload();

    // Mock API call (Replace with actual service call)
    console.log('Submitting final payload:', payload);

    // Simulate success
    alert('Sale Completed Successfully!');
    this.resetComponent();
  }

  // --- Navigation/Utility ---

  nextStage(): void {
    let proceed = true;

    // Validation guard clauses
    if (this.currentStage() === 2 && this.cartItems().length === 0) {
      alert('You must add at least one item to the cart.');
      proceed = false;
    } else if (this.currentStage() === 3 && this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      proceed = false;
    }

    if (proceed) {
      this.currentStage.update(stage => Math.min(stage + 1, this.stages.length));
    }
  }

  prevStage(): void {
    this.currentStage.update(stage => Math.max(stage - 1, 1));
  }

  goToStage(stage: number): void {
    // Only allow jumping back to a previous stage
    if (stage < this.currentStage()) {
      this.currentStage.set(stage);
    }
  }

  resetComponent(): void {
    this.currentStage.set(1);
    this.cartItems.set([]);
    this.newCustomerId.set(null);
    this.existingCustomerId.set(null);
    this.customerForm.reset();
    this.salesForm.reset({ quantity: 1 });
    this.paymentForm.reset({ sales_outlet: null, payment_method: 'CARD', payment_status: 'Completed' });
  }
}





<div class="container py-4">
    <h1 class="mb-4 text-primary fw-bold">Office POS Checkout System</h1>

    <ul class="nav nav-pills nav-justified mb-4">
        <li class="nav-item" *ngFor="let stage of stages; let i = index">
            <a class="nav-link"
               [class.active]="currentStage() === i + 1"
               [class.disabled]="currentStage() < i + 1"
               (click)="goToStage(i + 1)">
                <span class="badge rounded-pill me-2" [class.bg-primary]="currentStage() >= i + 1" [class.bg-secondary]="currentStage() < i + 1">{{ i + 1 }}</span>
                {{ stage }}
            </a>
        </li>
    </ul>

    <div class="card shadow-lg p-4">

        <div *ngIf="currentStage() === 1">
            <h2 class="card-title text-success mb-4">1. Customer Details (Optional)</h2>
            <form [formGroup]="customerForm" (ngSubmit)="submitNewCustomer()" class="row g-3">
                <div class="col-md-6">
                    <label for="firstName" class="form-label">First Name</label>
                    <input type="text" id="firstName" formControlName="firstName" class="form-control" placeholder="Jane">
                </div>
                <div class="col-md-6">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input type="text" id="lastName" formControlName="lastName" class="form-control" placeholder="Doe">
                </div>
                <div class="col-12">
                    <label for="phone" class="form-label">Phone/Contact</label>
                    <input type="text" id="phone" formControlName="phone" class="form-control" placeholder="e.g., +1234567890">
                </div>
                <div class="col-12 mt-4 d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-secondary" (click)="skipCustomer()">
                        Skip Customer <i class="bi bi-arrow-right"></i>
                    </button>
                    <button type="submit" class="btn btn-success" [disabled]="customerForm.invalid">
                        Add Customer & Continue <i class="bi bi-person-plus"></i>
                    </button>
                </div>
                <div *ngIf="customerForm.invalid && customerForm.touched" class="col-12 text-danger small mt-2">
                    Fill out at least the First Name correctly to add a new customer, or skip.
                </div>
            </form>
        </div>

        <div *ngIf="currentStage() === 2">
            <h2 class="card-title text-success mb-4">2. Add Sales Items ({{ totalItems() }} in cart)</h2>
            <p *ngIf="newCustomerId()">✅ New Customer ID: **{{ newCustomerId() }}** will be used.</p>
            <p *ngIf="!newCustomerId()" class="text-secondary small">Skipped customer details. Transaction will use a default/new ID.</p>

            <form [formGroup]="salesForm" class="mb-4">
                <div class="input-group">
                    <div class="autocomplete-container flex-grow-1 position-relative me-2">
                        <input type="text" formControlName="searchQuery" class="form-control" placeholder="Search by SKU or Product Name">
                        <ul class="list-group position-absolute w-100 z-100 shadow-sm" *ngIf="autocompleteResults.length > 0">
                            <li class="list-group-item list-group-item-action py-2 small"
                                *ngFor="let product of autocompleteResults"
                                (click)="selectProduct(product)">
                                **{{ product.sku }}** - {{ product.name }} (${{ product.unit_price }})
                            </li>
                        </ul>
                    </div>
                    <input type="number" formControlName="quantity" class="form-control text-center" style="width: 80px;" min="1" value="1">
                    <span class="input-group-text">Qty</span>
                </div>
            </form>

            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Product</th>
                            <th class="text-center">Qty</th>
                            <th class="text-end">Unit Price</th>
                            <th class="text-end">Subtotal</th>
                            <th class="text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngIf="totalItems() === 0">
                            <td colspan="5" class="text-center text-muted py-3">No items in the cart. Use the search bar to add products.</td>
                        </tr>
                        <tr *ngFor="let item of cartItems(); index as i">
                            <td>
                                <div class="fw-bold">{{ item.name }}</div>
                                <div class="small text-muted">SKU: {{ item.sku }}</div>
                            </td>
                            <td class="text-center">
                                <input type="number" [value]="item.quantity" (change)="updateItemQuantity(i, $event)" min="1" class="form-control form-control-sm text-center mx-auto" style="width: 70px;">
                            </td>
                            <td class="text-end">${{ item.unit_price }}</td>
                            <td class="text-end fw-bold">${{ item.subtotal | number:'1.2-2' }}</td>
                            <td class="text-center">
                                <button (click)="removeItem(i)" class="btn btn-sm btn-outline-danger p-1" aria-label="Remove item">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="3" class="text-end h5">GRAND TOTAL:</th>
                            <th class="text-end h5 text-primary">${{ subTotal() | number:'1.2-2' }}</th>
                            <th></th>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div class="d-flex justify-content-end mt-4">
                <button class="btn btn-primary" (click)="nextStage()" [disabled]="totalItems() === 0">
                    Next: Payment Details <i class="bi bi-arrow-right"></i>
                </button>
            </div>
        </div>

        <div *ngIf="currentStage() === 3">
            <h2 class="card-title text-success mb-4">3. Payment & Location</h2>
            <form [formGroup]="paymentForm" class="row g-3">
                <div class="col-md-6">
                    <label for="sales_outlet" class="form-label">Office Location ID (Sales Outlet)</label>
                    <input type="number" id="sales_outlet" formControlName="sales_outlet" class="form-control" placeholder="e.g., 1 or 101">
                    <div *ngIf="paymentForm.get('sales_outlet')?.invalid && paymentForm.get('sales_outlet')?.touched" class="text-danger small mt-1">Location ID is required.</div>
                </div>
                <div class="col-md-6">
                    <label for="payment_method" class="form-label">Payment Method</label>
                    <select id="payment_method" formControlName="payment_method" class="form-select">
                        <option value="CARD">Credit/Debit Card</option>
                        <option value="CASH">Cash</option>
                        <option value="TRANSFER">Bank Transfer</option>
                        <option value="MOMO">Mobile Money</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <div class="col-12">
                    <label for="payment_status" class="form-label">Payment Status</label>
                    <select id="payment_status" formControlName="payment_status" class="form-select">
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>

                <div class="col-12 mt-4 d-flex justify-content-between">
                    <button type="button" class="btn btn-secondary" (click)="prevStage()">
                        <i class="bi bi-arrow-left"></i> Back to Items
                    </button>
                    <button type="button" class="btn btn-primary" (click)="nextStage()" [disabled]="paymentForm.invalid">
                        Next: Review & Complete <i class="bi bi-check-circle"></i>
                    </button>
                </div>
            </form>
        </div>

        <div *ngIf="currentStage() === 4">
            <h2 class="card-title text-success mb-4">4. Review & Complete Sale</h2>

            <div class="row g-4">
                <div class="col-lg-6">
                    <div class="card bg-light shadow-sm">
                        <div class="card-header bg-primary text-white fw-bold">Transaction Data</div>
                        <div class="card-body">
                            <dl class="row mb-0">
                                <dt class="col-sm-5">Customer ID</dt>
                                <dd class="col-sm-7 fw-bold text-truncate">{{ newCustomerId() || existingCustomerId() || 'N/A (Using Auto-Generated)' }}</dd>

                                <dt class="col-sm-5">Location ID</dt>
                                <dd class="col-sm-7">{{ paymentForm.get('sales_outlet')?.value }}</dd>

                                <dt class="col-sm-5">Payment Method</dt>
                                <dd class="col-sm-7">{{ paymentForm.get('payment_method')?.value }}</dd>

                                <dt class="col-sm-5">Payment Status</dt>
                                <dd class="col-sm-7"><span class="badge bg-success">{{ paymentForm.get('payment_status')?.value }}</span></dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="card bg-light shadow-sm">
                        <div class="card-header bg-success text-white fw-bold">Financial Summary</div>
                        <div class="card-body">
                            <dl class="row mb-0">
                                <dt class="col-sm-5">Items Count</dt>
                                <dd class="col-sm-7">{{ totalItems() }}</dd>

                                <dt class="col-sm-5 h4 text-success">TOTAL</dt>
                                <dd class="col-sm-7 h4 text-success fw-bold">${{ subTotal() | number:'1.2-2' }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <h5 class="mt-4 mb-3">Items Review</h5>
            <div class="table-responsive">
                <table class="table table-sm table-bordered">
                    <thead>
                        <tr class="table-secondary">
                            <th>Product</th>
                            <th class="text-center">Qty</th>
                            <th class="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let item of cartItems()">
                            <td>{{ item.name }} ({{ item.sku }})</td>
                            <td class="text-center">{{ item.quantity }}</td>
                            <td class="text-end">${{ item.subtotal | number:'1.2-2' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mt-4 d-flex justify-content-between">
                <button type="button" class="btn btn-secondary" (click)="prevStage()">
                    <i class="bi bi-arrow-left"></i> Return to Payment
                </button>
                <button type="button" class="btn btn-success btn-lg" (click)="completeSale()">
                    <i class="bi bi-check-all"></i> CONFIRM & COMPLETE SALE
                </button>
            </div>
        </div>
    </div>
</div>
