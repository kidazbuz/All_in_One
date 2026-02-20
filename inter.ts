import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Logic } from './logics'; // Your API Service
import { Entity, ExpensePayload } from './data'; // Your Data Models


@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class Expenses implements OnInit {

  heading = 'Expenses Details';
  subheading = 'Manage Daily Expenses.';
  icon = 'pe-7s-wallet icon-gradient bg-malibu-beach';

  expenseForm!: FormGroup;
  isLoading: boolean = false; // State for loading spinner on submit
  isSubmitted: boolean = false; // <<< ADDED: Flag for showing validation errors

  // --- Mock Data for Selects ---
  paymentMethods: string[] = ['Cash', 'Credit Card', 'Mobile Money', 'Bank Transfer'];
  existingCategories: Entity[] = [
    { id: 1, name: 'Transport' },
    { id: 2, name: 'Groceries' },
    { id: 3, name: 'Utilities' },
  ];
  existingPayees: Entity[] = [
    { id: 10, name: 'Local Market' },
    { id: 11, name: 'Bus Company' },
  ];

  // Inject FormBuilder and the new custom service, 'Logic'
  constructor(
    private fb: FormBuilder,
    private expenseService: Logic // <<< UPDATED: Using 'Logic' as the service name
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupCategoryChange();
    this.setupPayeeChange();
  }

  // --- 1. Form Initialization ---
  private initializeForm(): void {
    this.expenseForm = this.fb.group({
      // --- MANDATORY CORE FIELDS ---
      expense_date: [this.formatDate(new Date()), Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      payment_method: ['', Validators.required],

      // --- CATEGORY ASSOCIATION FIELDS (Required via Custom Validator) ---
      category_choice: ['existing', Validators.required], // 'existing' or 'new'
      category_id: [null],
      new_category: this.fb.group({
        category_name: [''],
      }),

      // --- OPTIONAL PAYEE DETAILS ---
      payee_choice: ['none', Validators.required], // 'none', 'existing', or 'new'
      payee_id: [null],
      new_payee: this.fb.group({
        payee_name: [''],
        phone_number: [''],
        hasAddress: [false], // Toggle to show address fields
        address: this.fb.group({
          region: this.fb.group({
            name: [''], // Mandatory if hasAddress is true
          }),
          district: [''],
          ward: [''],
        }),
      }),
    }, { validators: [
      this.categoryAssociationValidator(),
      this.addressRegionValidator()
    ]});
  }

  // Helper to format date for the input field
  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  // --- 2. Dynamic Field Logic Subscriptions ---

  private setupCategoryChange(): void {
    const choiceControl = this.expenseForm.get('category_choice')!;
    const idControl = this.expenseForm.get('category_id')!;
    const nameControl = this.newCategory.get('category_name')!;

    choiceControl.valueChanges.subscribe(choice => {
      // Reset validators and values
      idControl.setValue(null);
      idControl.clearValidators();
      nameControl.setValue('');
      nameControl.clearValidators();

      if (choice === 'existing') {
        idControl.setValidators(Validators.required);
      } else if (choice === 'new') {
        nameControl.setValidators(Validators.required);
      }
      idControl.updateValueAndValidity();
      nameControl.updateValueAndValidity();
      this.expenseForm.updateValueAndValidity();
    });
  }

  private setupPayeeChange(): void {
    const choiceControl = this.expenseForm.get('payee_choice')!;
    const idControl = this.expenseForm.get('payee_id')!;
    const nameControl = this.newPayee.get('payee_name')!;
    const hasAddressControl = this.newPayee.get('hasAddress')!;

    choiceControl.valueChanges.subscribe(choice => {
      // Reset validators and values
      idControl.setValue(null);
      idControl.clearValidators();
      nameControl.setValue('');
      nameControl.clearValidators();
      hasAddressControl.setValue(false); // Reset address toggle

      if (choice === 'existing') {
        idControl.setValidators(Validators.required);
      } else if (choice === 'new') {
        nameControl.setValidators(Validators.required);
      }
      idControl.updateValueAndValidity();
      nameControl.updateValueAndValidity();
      this.expenseForm.updateValueAndValidity();
    });

    // Watch for Address toggle to apply region requirement
    hasAddressControl.valueChanges.subscribe(() => {
        this.expenseForm.updateValueAndValidity();
    });
  }

  // --- 3. Custom Validators (Run at the FormGroup level) ---

  // Category: Ensures ONE of the required fields is filled
  categoryAssociationValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const choice = control.get('category_choice')?.value;
      const id = control.get('category_id')?.value;
      const newName = control.get('new_category.category_name')?.value;

      if (choice === 'existing' && !id) {
        return { categoryMissing: true }; // Error for form group
      }
      if (choice === 'new' && !newName) {
        return { categoryMissing: true }; // Error for form group
      }
      return null;
    };
  }

  // Address Region: Ensures 'region.name' is filled if 'hasAddress' is true and 'payee_choice' is 'new'
  addressRegionValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const isNewPayee = control.get('payee_choice')?.value === 'new';
      const hasAddress = control.get('new_payee.hasAddress')?.value;
      const regionNameControl = control.get('new_payee.address.region.name');

      if (isNewPayee && hasAddress) {
        if (!regionNameControl?.value) {
            regionNameControl?.setErrors({ regionRequired: true }); // Mark specific field
            return { addressRegionRequired: true }; // Mark form group
        } else {
            // Clear error if valid, necessary because group validators run after control validators
            if (regionNameControl?.hasError('regionRequired')) {
                regionNameControl.setErrors(null);
            }
        }
      }
      return null;
    };
  }

  // --- 4. Getters for easier template access ---
  get newCategory(): FormGroup { return this.expenseForm.get('new_category') as FormGroup; }
  get newPayee(): FormGroup { return this.expenseForm.get('new_payee') as FormGroup; }
  get newPayeeAddress(): FormGroup { return this.newPayee.get('address') as FormGroup; }

  // --- 5. Submission Handler ---
  onSubmit(): void {
    this.isSubmitted = true; // <<< Set flag at start of submission attempt

    if (this.expenseForm.invalid) {
      console.error('Form is invalid! Check errors.');
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.isLoading = true; // Start loading

    const rawValue = this.expenseForm.getRawValue();

    // --- Construct the Final Payload Object ---
    const payload: ExpensePayload = {
      expense_date: rawValue.expense_date,
      amount: rawValue.amount,
      description: rawValue.description,
      payment_method: rawValue.payment_method,
    };

    // Build Category Payload
    if (rawValue.category_choice === 'existing') {
      payload.category_id = rawValue.category_id;
    } else if (rawValue.category_choice === 'new') {
      payload.new_category = rawValue.new_category;
    }

    // Build Payee Payload
    if (rawValue.payee_choice === 'existing') {
      payload.payee_id = rawValue.payee_id;
    } else if (rawValue.payee_choice === 'new') {
      const newPayeePayload: any = {
        payee_name: rawValue.new_payee.payee_name,
        phone_number: rawValue.new_payee.phone_number,
      };

      // Include address only if the user toggled it on and it's valid (region is required)
      if (rawValue.new_payee.hasAddress && rawValue.new_payee.address.region.name) {
        newPayeePayload.address = {
            region: { name: rawValue.new_payee.address.region.name },
            district: rawValue.new_payee.address.district,
            ward: rawValue.new_payee.address.ward,
        };
      }
      payload.new_payee = newPayeePayload;
    }

    // --- Call the Service ---
    this.expenseService.createExpense(payload)
      .subscribe({
        next: (response) => {
          console.log('Expense created successfully:', response);
          alert('Expense recorded successfully!');
          // Reset form selectively after success
          this.expenseForm.reset({
             expense_date: this.formatDate(new Date()),
             payment_method: '',
             category_choice: 'existing',
             payee_choice: 'none',
             new_payee: { hasAddress: false }
          });
          this.isLoading = false;
          this.isSubmitted = false; // <<< Reset flag on success
        },
        error: (error) => {
          console.error('API Error during expense creation:', error);
          alert('Failed to record expense. Please check input details.');
          this.isLoading = false;
          // isSubmitted remains true to show errors
        }
      });
  }
}



<app-page-title [heading]="heading" [subheading]="subheading" [icon]="icon"></app-page-title>

<div class="container my-4">
    <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10">

            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h4 class="mb-0">Daily Expense Submission</h4>
                </div>
                <div class="card-body">

                    <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">

                        <div class="row g-3 mb-4 border-bottom pb-3">
                            <h5 class="text-secondary">Core Expense Details <span class="text-danger">*</span></h5>

                            <div class="col-md-6">
                                <label for="expenseDate" class="form-label">Date</label>
                                <input id="expenseDate" type="date" class="form-control" formControlName="expense_date">
                                <div *ngIf="expenseForm.get('expense_date')?.invalid && (expenseForm.get('expense_date')?.touched || isSubmitted)" class="text-danger small mt-1">
                                    Date is required.
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label for="amount" class="form-label">Amount</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input id="amount" type="number" step="0.01" class="form-control" formControlName="amount" placeholder="e.g. 7.00">
                                </div>
                                <div *ngIf="expenseForm.get('amount')?.invalid && (expenseForm.get('amount')?.touched || isSubmitted)" class="text-danger small mt-1">
                                    Amount is required and must be positive.
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label for="paymentMethod" class="form-label">Payment Method</label>
                                <select id="paymentMethod" class="form-select" formControlName="payment_method">
                                    <option [ngValue]="null" disabled>Select method</option>
                                    <option *ngFor="let method of paymentMethods" [ngValue]="method">{{ method }}</option>
                                </select>
                                <div *ngIf="expenseForm.get('payment_method')?.invalid && (expenseForm.get('payment_method')?.touched || isSubmitted)" class="text-danger small mt-1">
                                    Payment method is required.
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label for="description" class="form-label">Description</label>
                                <input id="description" type="text" class="form-control" formControlName="description" placeholder="What did you spend money on?">
                                <div *ngIf="expenseForm.get('description')?.invalid && (expenseForm.get('description')?.touched || isSubmitted)" class="text-danger small mt-1">
                                    Description is required.
                                </div>
                            </div>
                        </div>


                        <div class="mb-4 border-bottom pb-3">
                            <h5 class="text-secondary">Category <span class="text-danger">*</span></h5>

                            <div class="btn-group w-100 mb-3" role="group">
                                <input type="radio" class="btn-check" id="catExisting" value="existing" formControlName="category_choice" autocomplete="off">
                                <label class="btn btn-outline-info" for="catExisting">Use Existing Category</label>

                                <input type="radio" class="btn-check" id="catNew" value="new" formControlName="category_choice" autocomplete="off">
                                <label class="btn btn-outline-info" for="catNew">Create New Category</label>
                            </div>

                            <div *ngIf="expenseForm.get('category_choice')?.value === 'existing'" class="mb-3">
                                <label for="categoryId" class="form-label">Select Category</label>
                                <select id="categoryId" class="form-select" formControlName="category_id">
                                    <option [ngValue]="null" disabled>Choose from list</option>
                                    <option *ngFor="let cat of existingCategories" [ngValue]="cat.id">{{ cat.name }}</option>
                                </select>
                                <div *ngIf="expenseForm.hasError('categoryMissing') && isSubmitted" class="text-danger small mt-1">
                                    A category must be selected.
                                </div>
                            </div>

                            <div *ngIf="expenseForm.get('category_choice')?.value === 'new'" formGroupName="new_category">
                                <label for="newCategoryName" class="form-label">New Category Name</label>
                                <input id="newCategoryName" type="text" class="form-control" formControlName="category_name" placeholder="e.g. Pet Supplies">
                                <div *ngIf="newCategory.get('category_name')?.invalid && (newCategory.get('category_name')?.touched || isSubmitted)" class="text-danger small mt-1">
                                    New category name is required.
                                </div>
                            </div>
                        </div>


                        <div class="mb-4 border-bottom pb-3">
                            <h5 class="text-secondary">Payee Details <span class="text-muted small">(Optional)</span></h5>

                            <div class="btn-group w-100 mb-3" role="group">
                                <input type="radio" class="btn-check" id="payeeNone" value="none" formControlName="payee_choice" autocomplete="off">
                                <label class="btn btn-outline-secondary" for="payeeNone">No Payee</label>

                                <input type="radio" class="btn-check" id="payeeExisting" value="existing" formControlName="payee_choice" autocomplete="off">
                                <label class="btn btn-outline-secondary" for="payeeExisting">Use Existing Payee</label>

                                <input type="radio" class="btn-check" id="payeeNew" value="new" formControlName="payee_choice" autocomplete="off">
                                <label class="btn btn-outline-secondary" for="payeeNew">Create New Payee</label>
                            </div>

                            <div *ngIf="expenseForm.get('payee_choice')?.value === 'existing'" class="mb-3">
                                <label for="payeeId" class="form-label">Select Payee</label>
                                <select id="payeeId" class="form-select" formControlName="payee_id">
                                    <option [ngValue]="null" disabled>Choose from list</option>
                                    <option *ngFor="let payee of existingPayees" [ngValue]="payee.id">{{ payee.name }}</option>
                                </select>
                                <div *ngIf="expenseForm.hasError('payeeMissing') && isSubmitted" class="text-danger small mt-1">
                                    A payee must be selected.
                                </div>
                            </div>

                            <div *ngIf="expenseForm.get('payee_choice')?.value === 'new'" formGroupName="new_payee" class="card card-body bg-light">
                                <h6 class="card-title text-dark">New Payee Information</h6>
                                <div class="row g-3">
                                    <div class="col-md-6 mb-3">
                                        <label for="payeeName" class="form-label">Payee Name <span class="text-danger">*</span></label>
                                        <input id="payeeName" type="text" class="form-control" formControlName="payee_name" placeholder="e.g. John's Taxi">
                                        <div *ngIf="newPayee.get('payee_name')?.invalid && (newPayee.get('payee_name')?.touched || isSubmitted)" class="text-danger small mt-1">
                                            Payee name is required.
                                        </div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="phoneNumber" class="form-label">Phone Number <span class="text-muted small">(Optional)</span></label>
                                        <input id="phoneNumber" type="tel" class="form-control" formControlName="phone_number">
                                    </div>
                                </div>

                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" role="switch" id="toggleAddress" formControlName="hasAddress">
                                    <label class="form-check-label" for="toggleAddress">Include Payee Address Details</label>
                                </div>

                                <div *ngIf="newPayee.get('hasAddress')?.value" formGroupName="address" class="border p-3 rounded bg-white">
                                    <h6 class="text-info">Address Details</h6>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div formGroupName="region">
                                                <label for="regionName" class="form-label">Region <span class="text-danger">*</span></label>
                                                <input id="regionName" type="text" class="form-control" formControlName="name" placeholder="e.g. Arusha">
                                                <div *ngIf="newPayeeAddress.get('region.name')?.invalid && (newPayeeAddress.get('region.name')?.touched || isSubmitted)" class="text-danger small mt-1">
                                                    Region is required for a new payee address.
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="district" class="form-label">District</label>
                                            <input id="district" type="text" class="form-control" formControlName="district">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="ward" class="form-label">Ward</label>
                                            <input id="ward" type="text" class="form-control" formControlName="ward">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-success btn-lg" [disabled]="expenseForm.invalid || isLoading">
                                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {{ isLoading ? 'Saving...' : 'Record Expense' }}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

        </div>
    </div>
</div>


.card-header {
    // Optional: Add a slight gradient for modern look
    background-image: linear-gradient(to right, #007bff, #0056b3);
}

.form-label {
    font-weight: 500; // Slightly bolder labels
}

// Style for the container card when showing optional groups
.card-body .card-body {
    border: 1px solid #dee2e6; // Lighter border for nested card
}

// Highlight required fields subtly
.text-danger {
    font-weight: 600;
}

// Adjust button group appearance for choice fields
.btn-group {
    label.btn-outline-info {
        border-color: var(--bs-info);
        &.active {
            background-color: var(--bs-info);
            color: white;
        }
    }
    label.btn-outline-secondary {
        border-color: var(--bs-secondary);
        &.active {
            background-color: var(--bs-secondary);
            color: white;
        }
    }
}
