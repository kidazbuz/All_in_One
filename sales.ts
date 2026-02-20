export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface SaleItem {
  id: number;
  product_specification: number;
  product_sku: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  unit_measure: string;
}

export interface SalesRecord {
  id: number;
  sale_date: string;
  total_amount: string;
  status: string;
  payment_method: string;
  payment_status: string;
  sales_outlet: number;
  sales_outlet_name: string;
  sales_agent: string;
  sales_agent_name: string;
  customer: Customer;
  items: SaleItem[];
}



import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for (ngModel) binding
import { SalesRecord, Customer } from './sales-data';

// Import RxJS operators and core
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap, finalize, map } from 'rxjs/operators';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';



const API_DATA: SalesRecord[] = [
  {
    "id": 101,
    "sale_date": "2025-11-24T13:26:20.409Z",
    "total_amount": "125000.50", // Example value
    "status": "COMPLETED",
    "payment_method": "CASH",
    "payment_status": "PAID",
    "sales_outlet": 1,
    "sales_outlet_name": "Headquarters Outlet",
    "sales_agent": "a1b2c3d4-5717-4562-b3fc-2c963f66afa6",
    "sales_agent_name": "Jane Smith",
    "customer": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "first_name": "alice", // Using lowercase to show TitleCase formatting
      "last_name": "johnson",
      "email": "alice@example.com",
      "phone_number": "555-1234"
    },
    "items": [
      { "id": 1, "product_specification": 10, "product_sku": "A100", "product_name": "Laptop Pro", "quantity": 1, "unit_price": "120000.00", "unit_measure": "pc" },
      { "id": 2, "product_specification": 20, "product_sku": "B200", "product_name": "Mouse Pad", "quantity": 2, "unit_price": "250.25", "unit_measure": "unit" }
    ]
  },
  {
    "id": 102,
    "sale_date": "2025-11-23T09:15:00.000Z",
    "total_amount": "45.99",
    "status": "PENDING",
    "payment_method": "CARD",
    "payment_status": "PENDING",
    "sales_outlet": 2,
    "sales_outlet_name": "City Mall Kiosk",
    "sales_agent": "f7e8d9c0-1122-3344-5566-778899aabbcc",
    "sales_agent_name": "John Doe",
    "customer": {
      "id": "f5e4d3c2-a1b2-c3d4-e5f6-a7b8c9d0e1f2",
      "first_name": "",
      "last_name": "",
      "email": "",
      "phone_number": ""
    },
    "items": [
      { "id": 3, "product_specification": 30, "product_sku": "C300", "product_name": "Small Coffee", "quantity": 5, "unit_price": "9.198", "unit_measure": "cup" }
    ]
  }
];


@Component({
  selector: 'app-sales-view',
  standalone: false,
  templateUrl: './sales-view.html',
  styleUrl: './sales-view.scss',
})
export class SalesView implements OnInit {

  heading = 'Sales Data';
  subheading = 'View Sales Details';
  icon = 'pe-7s-cash text-success';

  // Sales Filtering Properties
  public allSalesRecords: SalesRecord[] = [];
  public salesRecords: SalesRecord[] = [];
  public selectedFilter: string = 'all';

  // Sale Submission Properties (USING Angular Signals)
  public customerForm!: FormGroup;
  public paymentForm!: FormGroup;

  public submissionLoading = signal(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);
  public backendCustomerId = signal<string | null>(null);
  public currentStage = signal<number>(2);

  // Placeholder functions for external dependencies
  public cartItems = () => [{ product_specification_id: 1, quantity: 1, unit_price: 10.00, unit_measure: 'pc' }];
  public resetComponent = () => {};

  // NOTE: Replace with your actual API endpoint constants
  readonly CUSTOMER_CREATE_API = '/api/customers/create-or-update/';
  readonly SALES_RECORD_API = '/api/sales/sales-records/';


  constructor(private fb: FormBuilder, private http: HttpClient /* Angular HttpClient assumed */) {
    // Initialize dummy forms for the sake of compiling the methods
    this.customerForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      phone_number: ['', Validators.pattern(/^\d{10}$/)],
      email: ['', Validators.email]
    });
    this.paymentForm = this.fb.group({
      payment_method: ['CASH', Validators.required],
      payment_status: ['PAID', Validators.required]
    });
  }

  ngOnInit(): void {
    // Simulating API data assignment
    this.allSalesRecords = API_DATA;
    this.salesRecords = this.allSalesRecords; // Initialize table with all data
  }

  // =========================================================================
  // === CUSTOMER AND SALE SUBMISSION LOGIC ===
  // =========================================================================

  private createCustomerIfNecessary(): Observable<string | null> {
    const customerData = this.customerForm.value;
    const customerFilled = customerData.first_name || customerData.last_name || customerData.phone_number || customerData.email;

    if (!customerFilled || this.customerForm.invalid) {
        return of(null);
    }

    return this.http.post<{ id: string }>(this.CUSTOMER_CREATE_API, customerData)
        .pipe(
            tap(response => console.log('Customer Retrieved/Created ID:', response.id)),

            // FIX: Use 'map' to correctly transform the response object to the ID string
            map(response => response.id),

            catchError(err => {
                console.error('Customer lookup/creation failed:', err);

                const backendError = err.error;
                let errorMsg = 'Failed to process customer.';

                if (typeof backendError === 'object' && backendError !== null) {
                    const firstKey = Object.keys(backendError)[0];
                    if (firstKey && Array.isArray(backendError[firstKey])) {
                        errorMsg = `${firstKey}: ${backendError[firstKey].join(', ')}`;
                    } else {
                        errorMsg = JSON.stringify(backendError);
                    }
                } else if (err.message) {
                    errorMsg = err.message;
                }

                this.errorMessage.set(errorMsg);

                // CRITICAL FIX: Use throwError to halt the sale process
                return throwError(() => new Error(errorMsg));
            })
        );
  }

  private buildPayload(customerId: string | null): any {
      const paymentData = this.paymentForm.value;
      if (this.cartItems().length === 0) { throw new Error("Cannot build payload: Cart is empty."); }

      const itemsPayload = this.cartItems().map(item => ({
          product_specification_id: item.product_specification_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit_measure: item.unit_measure,
      }));

      return {
          customer_id: customerId,
          sales_outlet: null,
          payment_method: paymentData.payment_method,
          payment_status: paymentData.payment_status,
          items: itemsPayload
      };
  }

  private postSaleRecord(customerId: string | null): Observable<any> {
      try {
          const payload = this.buildPayload(customerId);
          return this.http.post<any>(this.SALES_RECORD_API, payload);
      } catch (e: any) {
          this.errorMessage.set(e.message);
          return of(null);
      }
  }

  completeSale(): void {
      // FIX: Check signal value by calling it
      if (this.submissionLoading()) { return; }
      if (this.cartItems().length === 0) { this.errorMessage.set("Cannot complete sale: The cart is empty."); this.currentStage.set(2); return; }
      if (this.paymentForm.invalid) { this.errorMessage.set("Cannot complete sale: Payment details are incomplete."); this.paymentForm.markAllAsTouched(); this.currentStage.set(3); return; }

      // FIX: Set signal value
      this.submissionLoading.set(true);
      this.successMessage.set(null);
      this.errorMessage.set(null);

      this.createCustomerIfNecessary()
          .pipe(
              switchMap(customerId => {
                  this.backendCustomerId.set(customerId);
                  return this.postSaleRecord(customerId);
              }),
              // FIX: Set signal value
              finalize(() => this.submissionLoading.set(false)),
              catchError(err => {
                  console.error('Sale Submission Failed (or Customer Step Error):', err);

                  // FIX: Read signal value by calling it. Only set error if not already set by customer step.
                  if (!this.errorMessage()) {
                      let apiErrorMessage = 'Server error during sale record.';
                      // ... (postSaleRecord error handling logic) ...
                      this.errorMessage.set(apiErrorMessage);
                  }
                  return of(null);
              })
          )
          .subscribe(response => {
              if (response) {
                  const transactionId = response.id || 'N/A';
                  this.successMessage.set(transactionId);
                  this.resetComponent();
              }
          });
  }


  // =========================================================================
  // === HELPER METHODS AND GETTERS ===
  // =========================================================================

  /** Helper function to apply title case to a single string. */
  private toTitleCase(value: string | null | undefined): string {
      if (!value) return '';
      return String(value).toLowerCase().split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
  }

  /** Calculates the total quantity of items. */
  getTotalQuantity(record: SalesRecord): number {
    return record.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /** Formats customer name for the table using Title Case. */
  formatName(firstName: string, lastName: string): string {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) return 'Anonymous Customer';

    return this.toTitleCase(fullName);
  }


  // =========================================================================
  // === FILTERING METHODS ===
  // =========================================================================

  onFilterChange(): void {
    if (this.selectedFilter === 'all') {
      this.salesRecords = this.allSalesRecords;
      return;
    }

    const now = new Date();
    this.salesRecords = this.allSalesRecords.filter(record => {
      const saleDate = new Date(record.sale_date);

      // 1. Daily Sales Filters
      if (this.selectedFilter === 'today') {
        return this.isSameDay(saleDate, now);
      }
      if (this.selectedFilter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return this.isSameDay(saleDate, yesterday);
      }
      if (this.selectedFilter === 'day-before-yesterday') {
        const dayBeforeYesterday = new Date(now);
        dayBeforeYesterday.setDate(now.getDate() - 2);
        return this.isSameDay(saleDate, dayBeforeYesterday);
      }
      // Specific date filter: date-21.11.2025
      if (this.selectedFilter.startsWith('date-')) {
        const targetDateString = this.selectedFilter.substring(5);
        const [day, month, year] = targetDateString.split('.').map(Number);
        const targetDate = new Date(year, month - 1, day); // Month is 0-indexed
        return this.isSameDay(saleDate, targetDate);
      }

      // 2. Weekly Sales Filters
      if (this.selectedFilter === 'current-week') {
        return this.isSameWeek(saleDate, now);
      }

      // 3. Monthly Sales Filters
      if (this.selectedFilter === 'current-month') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }
      // Specific month filter: month-10-2025
      if (this.selectedFilter.startsWith('month-')) {
        const [targetMonth, targetYear] = this.selectedFilter.substring(6).split('-').map(Number);
        return saleDate.getMonth() === targetMonth && saleDate.getFullYear() === targetYear;
      }

      return false;
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private isSameWeek(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setDate(d1.getDate() - d1.getDay());
    d2.setDate(d2.getDate() - d2.getDay());
    return d1.getTime() === d2.getTime();
  }
}


<div class="container-fluid py-4">
  <h2 class="mb-4">📋 Sales Records ({{ salesRecords.length }} Total)</h2>

  <div class="mb-3 d-flex align-items-center">
    <label for="salesFilter" class="form-label me-2 fw-bold">Filter Sales By:</label>
    <select
      id="salesFilter"
      class="form-select w-auto"
      [(ngModel)]="selectedFilter"
      (change)="onFilterChange()">

      <option value="all">-- Show All Records --</option>

      <optgroup label="Daily Sales">
        <option value="today">Today ({{ 'now' | date: 'dd.MM.yyyy' }})</option>
        <option value="yesterday">Yesterday ({{ 'now' | date: 'dd.MM.yyyy' : '-1' }})</option>
        <option value="day-before-yesterday">Day Before Yesterday</option>
        <option value="date-21.11.2025">21.11.2025</option>
        <option value="date-20.11.2025">20.11.2025</option>
      </optgroup>

      <optgroup label="Weekly Sales">
        <option value="current-week">Current Week</option>
      </optgroup>

      <optgroup label="Monthly Sales">
        <option value="current-month">Current Month ({{ 'now' | date: 'MMMM yyyy' }})</option>

        <option value="month-10-2025">November 2025</option>
        <option value="month-9-2025">October 2025</option>
      </optgroup>

    </select>
  </div>
  <div *ngIf="salesRecords.length === 0" class="alert alert-warning" role="alert">
    No sales records found for the selected filter ({{ selectedFilter | titlecase }}).
  </div>

  <table class="table table-striped table-hover">
    <thead>
      <tr class="table-primary">
        <th>ID</th>
        <th>Sale Date</th>
        <th>Customer</th>
        <th>Agent</th>
        <th>Total Items</th>
        <th>Total Amount</th>
        <th>Payment Status</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      <ng-container *ngFor="let record of salesRecords; let i = index">
        <tr [class.table-success]="record.status === 'COMPLETED'">
          <td>{{ record.id }}</td>
          <td>{{ record.sale_date | date: 'short' }}</td>
          <td>{{ formatName(record.customer.first_name, record.customer.last_name) }}</td>
          <td>{{ record.sales_agent_name }}</td>
          <td>{{ getTotalQuantity(record) }}</td>
          <td>
            {{ record.total_amount | currency: 'USD' : 'symbol' : '1.2-2' }}
          </td>
          <td>
            <span
              [class]="{
                'badge': true,
                'bg-success': record.payment_status === 'PAID',
                'bg-warning': record.payment_status === 'PENDING',
                'bg-danger': record.status !== 'COMPLETED'
              }">
              {{ record.status }} / {{ record.payment_method }}
            </span>
          </td>
          <td>
            <button
              class="btn btn-sm btn-outline-info"
              type="button"
              data-bs-toggle="collapse"
              [attr.data-bs-target]="'#details-' + i"
              aria-expanded="false"
              [attr.aria-controls]="'details-' + i">
              Items ({{ record.items.length }})
            </button>
          </td>
        </tr>

        <tr>
          <td colspan="8" class="p-0 border-0">
            <div class="collapse" [id]="'details-' + i">
              <div class="card card-body bg-light m-2">
                <h5>Items in Sale #{{ record.id }} ({{ record.items.length }})</h5>
                <table class="table table-sm table-bordered mb-0 bg-white">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of record.items">
                      <td>{{ item.product_name }}</td>
                      <td>{{ item.product_sku }}</td>
                      <td>{{ item.quantity }} {{ item.unit_measure }}</td>
                      <td>{{ item.unit_price | currency: 'USD' }}</td>
                      <td>{{ (item.quantity * (+item.unit_price)) | currency: 'USD' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      </ng-container>
    </tbody>
  </table>
</div>
