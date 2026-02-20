import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { faStar, faPlus, faEdit, faTrash, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ActionButton } from '../../../Layout/Components/page-title/page-title.component';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Inventory } from './inventory'; // Assuming this is your API Service
import { InventoryItem } from './data'; // Assuming this is the interface for list items
import { Test } from '../../../test/test'; // Assuming this is needed

@Component({
  selector: 'app-stock',
  standalone: false,
  templateUrl: './stock.html',
  styleUrl: './stock.scss',
})
export class Stock implements OnInit {

  heading = 'Stock Management';
  subheading = 'Stock adjastment & settings';
  icon = 'pe-7s-box2 text-warning';
  currentJustify = 'start';
  isEditing = false;

  currentItem: InventoryItem = this.getNewEmptyItem();

  // Data State
  products: string[] = []; // Changed to string[] to match Typeahead data
  locations: string[] = []; // Changed to string[] to match Typeahead data
  inventoryItems: InventoryItem[] = []; // Using InventoryItem type
  data = '';
  selectedInventoryItem: InventoryItem | null = null;

  // Forms
  safetyStockForm: FormGroup;
  adjustmentForm: FormGroup;
  inventoryForm: FormGroup; // Form used for the Add/Edit Modal

  // UI State
  loading = true;

  // 💡 CORRECTED: Formatter controls the display of the result in the input
  public formatter = (value: string): string => value;
  // 💡 CORRECTED: Input Formatter controls the display of the result in the dropdown
  public inputFormatter = (value: string): string => value.toUpperCase();

  stockItem: any; // Type 'any' used here as a legacy property from previous code

  @ViewChild('content') content!: ElementRef;
  constructor(private fb: FormBuilder, private inventoryService: Inventory, private modalService: NgbModal) {

    // --- 1. Form for InventorySerializer (Safety Stock / Location Update) ---
    this.safetyStockForm = this.fb.group({
      id: [null],
      safety_stock_level: [5, [Validators.required, Validators.min(0)]],
      location: [null, [Validators.required]] // Foreign key ID
    });

    // --- 2. Form for StockAdjustmentSerializer (Transactional Logic) ---
    this.adjustmentForm = this.fb.group({
      product_sku: ['', Validators.required],
      // Allow positive (restock) or negative (removal) integers
      adjustment_quantity: [null, [Validators.required, Validators.pattern(/^-?\d+$/)]],
      unit_cost: [0.00, [Validators.min(0)]],
      reason: ['', Validators.required]
    });

    // --- 3. Form for New Inventory Item Modal (Typeahead Fixes) ---
    this.inventoryForm = new FormGroup({
      // 💡 FIX: Typeahead binds strings, so we use '' and remove Validators.min(1)
      'product': new FormControl('', [
        Validators.required
      ]),
      'quantity_in_stock': new FormControl('', [
        Validators.required,
        Validators.min(0)
      ]),
      'safety_stock_level': new FormControl('', [
        Validators.required,
        Validators.min(0)
      ]),
      // 💡 FIX: Typeahead binds strings, so we use '' and remove Validators.min(1)
      'location': new FormControl('', [
        Validators.required
      ])
    });

    this.stockItem = this.inventoryForm.value;
  }

  // --- Lifecycle Hook: Ensures data is loaded on component initialization ---
  ngOnInit(): void {
    this.loadProductsList();
    this.loadlocationsList();
    this.loadInventoryList();
  }

  // --- CRUD/Form Submission ---

  onSubmit() {
    if (this.inventoryForm.valid) {
      const formData = this.inventoryForm.value;

      // ... (service call commented out)

      // 💡 FIX: Resetting with string values to match the Typeahead form controls
      this.inventoryForm.reset({
        product: '',
        quantity_in_stock: 0,
        safety_stock_level: 0,
        location: ''
      });
    } else {
      console.error('Form is invalid! Please check the fields.');
    }
  }

  getNewEmptyItem(): InventoryItem {
    return {
      id: 0,
      product: '',
      quantity_in_stock: 0,
      safety_stock_level: 0,
      location: ''
    };
  }

  // --- Typeahead Search Functions ---

  searchProduct = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      // Filter the products array of strings
      map(term => term.length < 2 ? [] : this.products.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );

  searchLocation = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      // Filter the locations array of strings
      map(term => term.length < 2 ? [] : this.locations.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );

  // --- Modal Logic ---

  openAddModal() {
    this.isEditing = false;
    this.currentItem = this.getNewEmptyItem();
    this.inventoryForm.reset(); // Ensure form is reset before opening
    this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' });
  }

  openEditModal(item: InventoryItem) {
    this.isEditing = true;
    this.currentItem = { ...item };

    // Patch the inventoryForm with the item's current values
    this.inventoryForm.patchValue({
      product: item.product,
      quantity_in_stock: item.quantity_in_stock,
      safety_stock_level: item.safety_stock_level,
      location: item.location
    });

    this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' });
  }

  handleCreateModal = () => {
    this.openAddModal();
  }

  // --- Data Loading ---

  loadInventoryList(): void {
    this.inventoryService.getInventoryList().subscribe({
      next: (data: InventoryItem[]) => {
        this.inventoryItems = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load inventory:', err);
        this.loading = false;
      }
    });
  }

  loadProductsList(): void {
    // Assuming API returns an array of strings (product names)
    this.inventoryService.getProducts().subscribe({
      next: (data: string[]) => {
        this.products = data;
      },
      error: (err: any) => {
        console.error('Failed to load products:', err);
      }
    });
  }

  loadlocationsList(): void {
    // Assuming API returns an array of strings (location names)
    this.inventoryService.getLocations().subscribe({
      next: (data: string[]) => {
        this.locations = data;
      },
      error: (err: any) => {
        console.error('Failed to load locations:', err);
      }
    });
  }

  // --- Inventory Status Update Logic (PATCH to /inventory/ID/) ---

  selectItemForUpdate(item: InventoryItem): void {
    this.selectedInventoryItem = item;
    // Patch form with current values for editing
    this.safetyStockForm.patchValue({
      id: item.id,
      safety_stock_level: item.safety_stock_level,
      location: item.location
    });
  }

  // ... (updateSafetyStock and submitAdjustment logic is unchanged)

  updateSafetyStock(): void {
    if (this.safetyStockForm.invalid) return;
    const itemId = this.safetyStockForm.get('id')?.value;
    // Only send the fields that can be updated based on your serializer's read_only_fields
    const payload = {
      safety_stock_level: this.safetyStockForm.value.safety_stock_level,
      location: this.safetyStockForm.value.location
    };

    this.inventoryService.updateInventoryItem(itemId, payload).subscribe({
      next: () => {
        alert('Safety stock and location updated successfully!');
        this.loadInventoryList(); // Refresh list to show changes
        this.selectedInventoryItem = null; // Close edit row
      },
      error: (err) => alert(`Update failed: ${err.error.detail || 'Server error'}`)
    });
  }

  // --- Stock Adjustment Logic (POST to /stock-adjustment/) ---

  submitAdjustment(): void {
    if (this.adjustmentForm.invalid) return;

    this.inventoryService.submitStockAdjustment(this.adjustmentForm.value).subscribe({
      next: (response) => {
        alert(`Stock adjustment recorded successfully! Movement ID: ${response.id}`);
        this.adjustmentForm.reset({ unit_cost: 0.00 }); // Reset form
        this.loadInventoryList(); // Refresh inventory status after transaction
      },
      error: (err) => {
        // Display backend validation error (e.g., insufficient stock check)
        const errorMsg = err.error.adjustment_quantity || err.error.product_sku || err.error.detail || 'Server error';
        alert(`Adjustment failed: ${errorMsg}`);
      }
    });
  }


  actionButtons: ActionButton[] = [
      {
          text: 'Add Stock Value',
          icon: faPlus,
          class: 'btn-success',
          onClick: this.handleCreateModal
      }
  ];
}
