<<<<<<< HEAD
import {
  Component,
  signal,
  computed,
  viewChild,
  ElementRef,
  AfterViewInit,
  inject,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, startWith, map, filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

// Define the shape of a product
interface Product {
  id: number;
  name: string;
}

// Mock data to simulate an API response
const MOCK_PRODUCTS: Product[] = [
  { id: 101, name: 'Laptop Pro X (Newest Model)' },
  { id: 102, name: 'Mechanical Keyboard RGB' },
  { id: 103, name: 'Wireless Ergonomic Mouse' },
  { id: 104, name: '4K HDR Monitor 32 Inch' },
  { id: 105, name: 'Portable SSD 2TB High Speed' },
  { id: 106, name: 'Smartwatch Series 8' },
  { id: 107, name: 'Noise Cancelling Headphones' },
  { id: 108, name: 'USB-C Docking Station' },
  { id: 109, name: 'Gaming Chair Stealth Edition' },
  { id: 110, name: 'Webcam 1080p with Mic' },
];

@Component({
  selector: 'app-search',
  standalone: false,
  // imports: [ReactiveFormsModule, RouterLink],
  template: `
    <!-- Main wrapper -->
    <div class="relative flex justify-center items-center h-full">
      <div class="searchBox">
        <form (submit)="submit($event)">
          <input
            [style]="{
              width: '22rem',
              overflow: 'hidden',
              background: 'white',
              color: 'black'
            }"
            type="text"
            [formControl]="searchControl"
            (focus)="showInput()"
            (blur)="hideInput()"
            #searchInput
            placeholder="Search desired product"
          />
        </form>
        <!-- Custom SVG Search Icon replacement for bi bi-search -->
        <svg
          class="searchIcon"
          (click)="submit($event)"
          (mousedown)="onMouseDown($event)"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>

        <!-- Search Results Dropdown -->
        <div
          class="searchResults"
          [@slideIn]="isVisible() ? 'visible' : 'hidden'"
          *ngIf="isVisible()"
          (mousedown)="onMouseDown($event)"
        >
          <div class="searchResult">
            @for (item of foundItems(); track item.id) {
            <a [routerLink]="['/product', item.id]" (click)="hideInput()" class="search-item-link">
              <!-- Search Icon for result item -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="inline mr-2 text-gray-500"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span> {{ item.name }} </span>
            </a>
            }@empty {
            <p class="placeHolderTxt">Nothing found.</p>
            }
          </div>
        </div>
      </div>
      <!-- Overlay to close on click outside -->
      <div
        class="overlay"
        *ngIf="isVisible()"
        (click)="isVisible.set(false)"
      ></div>
    </div>
  `,
  styles: [
    `
      /*
       * Global styles for icons (using Tailwind assumed base for typography/color)
       * Bi-search replaced with inline SVG for component self-containment.
       */

      .searchBox {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        /* Padding adapted for responsiveness */
        padding-left: 300px;
        width: 100%; /* Ensure it spans available width */
        max-width: 700px; /* Limit max width for desktop */
      }

      .searchBox input {
        width: 100%; /* Make input full width of its container */
        max-width: 400px;
        padding: 10px 40px 10px 20px;
        font-size: 16px;
        outline: none;
        border: 2px solid #ccc;
        border-radius: 8px; /* Added rounded corners for modern look */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: border-color 0.3s, box-shadow 0.3s;
      }

      .searchBox input:focus {
        border-color: #0073e6;
        box-shadow: 0 2px 8px rgba(0, 115, 230, 0.3);
      }

      .searchBox input::placeholder {
        color: #999;
      }

      .searchBox .searchIcon {
        position: absolute;
        cursor: pointer;
        font-size: 20px;
        right: 20px;
        color: #666;
        transition: color 0.2s;
        z-index: 101; /* Ensure icon is above input */
      }

      .searchBox .searchIcon:hover {
        color: #0073e6;
      }

      .searchBox .searchResults {
        /* Width adjusted based on input width */
        width: min(650px, 90vw);
        height: 400px;
        background-color: #f9f9f9;
        position: absolute;
        display: flex;
        flex-direction: column;
        top: 85px;
        left: 50%;
        transform: translateX(calc(-50% + 150px)); /* Centering logic adjusted due to initial padding-left: 300px */
        z-index: 350;
        overflow-y: scroll;
        overflow-x: hidden;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: fadeIn 0.3s ease-out;
      }

      .searchBox .searchResults::-webkit-scrollbar {
        width: 8px;
      }

      .searchBox .searchResults::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 4px;
      }

      .searchBox .searchResult {
        width: 100%;
        padding: 20px;
        gap: 15px; /* Reduced gap from 35px for better density */
        display: flex;
        flex-direction: column;
      }

      .searchBox .searchResult .placeHolderTxt {
        text-align: center;
        font-size: 20px;
        font-family: 'Inter', 'Sans-Serif';
        font-weight: 600;
        color: #999;
        padding-top: 50px;
      }

      .searchBox .searchResult .search-item-link {
        color: #333;
        text-decoration: none;
        font-family: 'Inter', 'Sans-Serif';
        font-weight: 500;
        padding: 8px 10px;
        border-radius: 4px;
        transition: background-color 0.2s, color 0.2s;
        display: flex;
        align-items: center;
      }

      .searchBox .searchResult .search-item-link:hover {
        background-color: #e6f0ff;
        color: #0073e6;
      }

      .overlay {
        position: fixed;
        top: 0; /* Adjusted from 80px to 0 for full-screen overlay */
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 50; /* Below search results but above everything else */
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px) translateX(calc(-50% + 150px)); }
        to { opacity: 1; transform: translateY(0) translateX(calc(-50% + 150px)); }
      }

      /* --- RESPONSIVE STYLES --- */

      /* Tablet/Small Desktop */
      @media (max-width: 1024px) {
        .searchBox {
          padding-left: 150px;
        }
        .searchBox .searchResults {
            transform: translateX(calc(-50% + 75px)); /* Adjusted centering */
        }
      }

      /* Mobile/Tablet */
      @media (max-width: 768px) {
        /* Remove results dropdown entirely */
        .searchBox .searchResults {
          display: none;
        }

        .searchBox {
          width: 90%;
          max-width: 400px;
          padding: 0; /* Remove padding-left */
        }

        .searchBox input {
          max-width: 100%;
        }
      }

      /* Smaller Mobile */
      @media (max-width: 425px) {
        .searchBox {
          width: 95%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Search implements AfterViewInit {
  // Signals for state management
  searchControl = new FormControl('', { nonNullable: true });
  isVisible = signal(false);

  // ViewChild reference for the input element
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // Stream of search term values, debounced and converted to a signal
  private searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map((term) => term.trim().toLowerCase())
    )
  );

  // Computed signal for filtered products
  foundItems = computed<Product[]>(() => {
    const term = this.searchTerm();
    if (!term) {
      // If the search term is empty, return top 5 suggestions or all mock data
      return MOCK_PRODUCTS.slice(0, 5);
    }
    // Filter the mock products
    return MOCK_PRODUCTS.filter((product) =>
      product.name.toLowerCase().includes(term)
    );
  });

  // Flag to prevent 'blur' from closing the dropdown immediately when clicking on a result
  private mouseDownOnElement = false;

  ngAfterViewInit() {
    // Optionally focus the input if needed on load
  }

  submit(event: Event) {
    event.preventDefault();
    // In a real application, this would trigger a navigation to the search results page
    const term = this.searchControl.value;
    console.log(`Searching for: ${term}`);
    this.hideInput();
  }

  showInput() {
    // Only show if the search term is not empty or we have suggestions
    this.isVisible.set(true);
  }

  hideInput() {
    // Timeout is necessary to allow onMouseDown event to register first
    setTimeout(() => {
      if (!this.mouseDownOnElement) {
        this.isVisible.set(false);
      }
      // Reset the flag immediately after the blur check
      this.mouseDownOnElement = false;
    }, 150);
  }

  onMouseDown(event: MouseEvent) {
    // Prevent the 'blur' event from firing when clicking on the search icon or results panel
    this.mouseDownOnElement = true;
    event.preventDefault();

    // If clicking the search icon, force focus on input to re-open results (if hidden)
    if (this.searchInput() && (event.target as HTMLElement).closest('.searchIcon')) {
        this.searchInput()?.nativeElement.focus();
    }
  }
}
=======
import {
  Component,
  signal,
  computed,
  viewChild,
  ElementRef,
  AfterViewInit,
  inject,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, startWith, map, filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

// Define the shape of a product
interface Product {
  id: number;
  name: string;
}

// Mock data to simulate an API response
const MOCK_PRODUCTS: Product[] = [
  { id: 101, name: 'Laptop Pro X (Newest Model)' },
  { id: 102, name: 'Mechanical Keyboard RGB' },
  { id: 103, name: 'Wireless Ergonomic Mouse' },
  { id: 104, name: '4K HDR Monitor 32 Inch' },
  { id: 105, name: 'Portable SSD 2TB High Speed' },
  { id: 106, name: 'Smartwatch Series 8' },
  { id: 107, name: 'Noise Cancelling Headphones' },
  { id: 108, name: 'USB-C Docking Station' },
  { id: 109, name: 'Gaming Chair Stealth Edition' },
  { id: 110, name: 'Webcam 1080p with Mic' },
];

@Component({
  selector: 'app-search',
  standalone: false,
  // imports: [ReactiveFormsModule, RouterLink],
  template: `
    <!-- Main wrapper -->
    <div class="relative flex justify-center items-center h-full">
      <div class="searchBox">
        <form (submit)="submit($event)">
          <input
            [style]="{
              width: '22rem',
              overflow: 'hidden',
              background: 'white',
              color: 'black'
            }"
            type="text"
            [formControl]="searchControl"
            (focus)="showInput()"
            (blur)="hideInput()"
            #searchInput
            placeholder="Search desired product"
          />
        </form>
        <!-- Custom SVG Search Icon replacement for bi bi-search -->
        <svg
          class="searchIcon"
          (click)="submit($event)"
          (mousedown)="onMouseDown($event)"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>

        <!-- Search Results Dropdown -->
        <div
          class="searchResults"
          [@slideIn]="isVisible() ? 'visible' : 'hidden'"
          *ngIf="isVisible()"
          (mousedown)="onMouseDown($event)"
        >
          <div class="searchResult">
            @for (item of foundItems(); track item.id) {
            <a [routerLink]="['/product', item.id]" (click)="hideInput()" class="search-item-link">
              <!-- Search Icon for result item -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="inline mr-2 text-gray-500"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span> {{ item.name }} </span>
            </a>
            }@empty {
            <p class="placeHolderTxt">Nothing found.</p>
            }
          </div>
        </div>
      </div>
      <!-- Overlay to close on click outside -->
      <div
        class="overlay"
        *ngIf="isVisible()"
        (click)="isVisible.set(false)"
      ></div>
    </div>
  `,
  styles: [
    `
      /*
       * Global styles for icons (using Tailwind assumed base for typography/color)
       * Bi-search replaced with inline SVG for component self-containment.
       */

      .searchBox {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        /* Padding adapted for responsiveness */
        padding-left: 300px;
        width: 100%; /* Ensure it spans available width */
        max-width: 700px; /* Limit max width for desktop */
      }

      .searchBox input {
        width: 100%; /* Make input full width of its container */
        max-width: 400px;
        padding: 10px 40px 10px 20px;
        font-size: 16px;
        outline: none;
        border: 2px solid #ccc;
        border-radius: 8px; /* Added rounded corners for modern look */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: border-color 0.3s, box-shadow 0.3s;
      }

      .searchBox input:focus {
        border-color: #0073e6;
        box-shadow: 0 2px 8px rgba(0, 115, 230, 0.3);
      }

      .searchBox input::placeholder {
        color: #999;
      }

      .searchBox .searchIcon {
        position: absolute;
        cursor: pointer;
        font-size: 20px;
        right: 20px;
        color: #666;
        transition: color 0.2s;
        z-index: 101; /* Ensure icon is above input */
      }

      .searchBox .searchIcon:hover {
        color: #0073e6;
      }

      .searchBox .searchResults {
        /* Width adjusted based on input width */
        width: min(650px, 90vw);
        height: 400px;
        background-color: #f9f9f9;
        position: absolute;
        display: flex;
        flex-direction: column;
        top: 85px;
        left: 50%;
        transform: translateX(calc(-50% + 150px)); /* Centering logic adjusted due to initial padding-left: 300px */
        z-index: 350;
        overflow-y: scroll;
        overflow-x: hidden;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: fadeIn 0.3s ease-out;
      }

      .searchBox .searchResults::-webkit-scrollbar {
        width: 8px;
      }

      .searchBox .searchResults::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 4px;
      }

      .searchBox .searchResult {
        width: 100%;
        padding: 20px;
        gap: 15px; /* Reduced gap from 35px for better density */
        display: flex;
        flex-direction: column;
      }

      .searchBox .searchResult .placeHolderTxt {
        text-align: center;
        font-size: 20px;
        font-family: 'Inter', 'Sans-Serif';
        font-weight: 600;
        color: #999;
        padding-top: 50px;
      }

      .searchBox .searchResult .search-item-link {
        color: #333;
        text-decoration: none;
        font-family: 'Inter', 'Sans-Serif';
        font-weight: 500;
        padding: 8px 10px;
        border-radius: 4px;
        transition: background-color 0.2s, color 0.2s;
        display: flex;
        align-items: center;
      }

      .searchBox .searchResult .search-item-link:hover {
        background-color: #e6f0ff;
        color: #0073e6;
      }

      .overlay {
        position: fixed;
        top: 0; /* Adjusted from 80px to 0 for full-screen overlay */
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 50; /* Below search results but above everything else */
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px) translateX(calc(-50% + 150px)); }
        to { opacity: 1; transform: translateY(0) translateX(calc(-50% + 150px)); }
      }

      /* --- RESPONSIVE STYLES --- */

      /* Tablet/Small Desktop */
      @media (max-width: 1024px) {
        .searchBox {
          padding-left: 150px;
        }
        .searchBox .searchResults {
            transform: translateX(calc(-50% + 75px)); /* Adjusted centering */
        }
      }

      /* Mobile/Tablet */
      @media (max-width: 768px) {
        /* Remove results dropdown entirely */
        .searchBox .searchResults {
          display: none;
        }

        .searchBox {
          width: 90%;
          max-width: 400px;
          padding: 0; /* Remove padding-left */
        }

        .searchBox input {
          max-width: 100%;
        }
      }

      /* Smaller Mobile */
      @media (max-width: 425px) {
        .searchBox {
          width: 95%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Search implements AfterViewInit {
  // Signals for state management
  searchControl = new FormControl('', { nonNullable: true });
  isVisible = signal(false);

  // ViewChild reference for the input element
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // Stream of search term values, debounced and converted to a signal
  private searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map((term) => term.trim().toLowerCase())
    )
  );

  // Computed signal for filtered products
  foundItems = computed<Product[]>(() => {
    const term = this.searchTerm();
    if (!term) {
      // If the search term is empty, return top 5 suggestions or all mock data
      return MOCK_PRODUCTS.slice(0, 5);
    }
    // Filter the mock products
    return MOCK_PRODUCTS.filter((product) =>
      product.name.toLowerCase().includes(term)
    );
  });

  // Flag to prevent 'blur' from closing the dropdown immediately when clicking on a result
  private mouseDownOnElement = false;

  ngAfterViewInit() {
    // Optionally focus the input if needed on load
  }

  submit(event: Event) {
    event.preventDefault();
    // In a real application, this would trigger a navigation to the search results page
    const term = this.searchControl.value;
    console.log(`Searching for: ${term}`);
    this.hideInput();
  }

  showInput() {
    // Only show if the search term is not empty or we have suggestions
    this.isVisible.set(true);
  }

  hideInput() {
    // Timeout is necessary to allow onMouseDown event to register first
    setTimeout(() => {
      if (!this.mouseDownOnElement) {
        this.isVisible.set(false);
      }
      // Reset the flag immediately after the blur check
      this.mouseDownOnElement = false;
    }, 150);
  }

  onMouseDown(event: MouseEvent) {
    // Prevent the 'blur' event from firing when clicking on the search icon or results panel
    this.mouseDownOnElement = true;
    event.preventDefault();

    // If clicking the search icon, force focus on input to re-open results (if hidden)
    if (this.searchInput() && (event.target as HTMLElement).closest('.searchIcon')) {
        this.searchInput()?.nativeElement.focus();
    }
  }
}
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
