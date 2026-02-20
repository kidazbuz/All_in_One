<<<<<<< HEAD
import { Component, signal, OnInit, HostListener } from '@angular/core';

// Define the navigation link structure
interface NavLink {
  label: string;
  link: string;
}

@Component({
  selector: 'app-trial',
  standalone: false,
  template: `
    <!--
      NAVIGATION BAR (STICKY)
      Uses custom classes for styling and responsiveness defined in the 'styles' array below.
    -->
    <nav class="navbar" [class.menu-open]="isMobileMenuOpen()">
      <div class="nav-container">
        <!-- Main Header Row -->
        <div class="nav-header">

          <!-- 1. LEFT GROUP: Mobile Menu Button & Brand Logo -->
          <div class="nav-left">
            <!-- Mobile Menu Button (Hamburger) - Visible on small devices -->
            <button (click)="toggleMenu()" type="button" aria-controls="mobile-menu"
                    [attr.aria-expanded]="isMobileMenuOpen()"
                    class="menu-toggle">

              @if (!isMobileMenuOpen()) {
                <!-- Menu Icon (Hamburger) -->
                <svg class="icon-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              } @else {
                <!-- Close Icon (X) -->
                <svg class="icon-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            </button>
            <!-- Brand Logo/Name -->
            <a href="/" class="brand-logo">TechShop</a>
          </div>

          <!-- 2. CENTER GROUP: Search Input -->
          <div class="search-container">
            <div class="search-wrapper">
              <input type="search" placeholder="Search for products..."
                    class="search-input">
              <!-- Search Icon -->
              <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- 3. RIGHT GROUP: Desktop Links & Mobile/Desktop Actions -->
          <div class="nav-right">

            <!-- Desktop Navigation Links (Hidden on small, shown on large) -->
            <div class="desktop-links">
              @for (nav of mainNavLinks; track nav.label) {
                <a [href]="nav.link"
                  class="nav-link"
                  [class.deal-link]="nav.label === 'Deals'">
                  {{ nav.label }}
                </a>
              }
            </div>

            <!-- Action Icons (Sign In & Cart) - Always visible -->
            <a href="/login" title="Sign in" class="action-icon">
              <!-- User Icon -->
              <svg class="icon-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span class="sr-only">Sign in</span>
            </a>
            <a href="/cart" title="Cart" class="action-icon cart-icon-wrapper">
              <!-- Shopping Cart Icon -->
              <svg class="icon-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span class="sr-only">Cart</span>
              <!-- Cart Count Badge -->
              <span class="cart-badge">3</span>
            </a>
          </div>
        </div>

        <!-- Mobile Menu Drawer (Toggled by the isMobileMenuOpen signal) -->
        @if (isMobileMenuOpen()) {
          <div id="mobile-menu" class="mobile-menu-drawer">
            <div class="mobile-links-container">
              @for (nav of mobileNavLinks; track nav.label) {
                <a [href]="nav.link"
                  class="mobile-nav-link"
                  [class.deal-link]="nav.label === 'Deals'">
                  {{ nav.label }}
                </a>
              }
            </div>
          </div>
        }
      </div>
    </nav>

    <!-- Content Placeholder -->
    <div class="content-area">
      <h1>E-commerce Landing Page Content (Pure CSS)</h1>
      <p>Scroll down to see the sticky navigation bar in action!</p>
      <div class="hero-section">
          <p>Hero Section / Promotional Banner</p>
      </div>
      <!-- Generate some long content to enable scrolling -->
      <div class="product-grid">
          @for (item of [1,2,3,4,5,6,7,8,9,10]; track item) {
              <div class="product-card">Product Category {{ item }}</div>
          }
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

    /* Variable approximations */
    :root {
      --primary-color: #4f46e5; /* indigo-600 */
      --primary-light: #eef2ff; /* indigo-50 */
      --red-color: #ef4444; /* red-500 */
      --text-color: #374151; /* gray-700 */
      --header-height: 4rem;
    }

    /* Base Styles */
    :host {
        display: block;
    }

    body {
        font-family: 'Inter', sans-serif;
        background-color: #f3f4f6;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }

    /* --- NAVBAR STYLES --- */
    .navbar {
        position: sticky;
        top: 0;
        z-index: 500;
        background-color: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid rgba(238, 242, 255, 0.5);
        transition: background-color 0.3s ease;
    }

    .nav-container {
        max-width: 80rem;
        margin-left: auto;
        margin-right: auto;
        padding-left: 1rem;
        padding-right: 1rem;
    }

    @media (min-width: 640px) {
        .nav-container {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
        }
    }
    @media (min-width: 1024px) {
        .nav-container {
            padding-left: 2rem;
            padding-right: 2rem;
        }
    }

    .nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: var(--header-height);
    }

    /* 1. LEFT GROUP */
    .nav-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .menu-toggle {
        padding: 0.5rem;
        border-radius: 0.5rem;
        color: #4b5563;
        transition: all 150ms ease-in-out;
        border: none;
        background: transparent;
        cursor: pointer;
    }

    .menu-toggle:hover {
        background-color: var(--primary-light);
        color: var(--primary-color);
    }

    @media (min-width: 1024px) {
        .menu-toggle {
            display: none;
        }
    }

    .brand-logo {
        font-size: 1.25rem;
        font-weight: 900;
        color: var(--primary-color);
        letter-spacing: -0.025em;
    }

    @media (min-width: 640px) {
        .brand-logo {
            font-size: 1.5rem;
        }
    }

    /* 2. CENTER GROUP: Search */
    .search-container {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        order: 2;
        margin-left: 0.5rem;
        margin-right: 0.5rem;
    }

    @media (min-width: 640px) {
        .search-container {
            margin-left: 1rem;
            margin-right: 1rem;
        }
    }

    @media (min-width: 1024px) {
        .search-container {
            flex-grow: 0;
            max-width: 28rem;
            margin-left: 0;
            margin-right: 0;
        }
    }

    .search-wrapper {
        position: relative;
        width: 100%;
    }

    .search-input {
        width: 100%;
        padding: 0.5rem 1rem 0.5rem 2.5rem;
        font-size: 0.875rem;
        border: 1px solid #d1d5db;
        border-radius: 0.75rem;
        transition: all 150ms ease-in-out;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    .search-input:focus {
        border-color: var(--primary-color);
        outline: 2px solid var(--primary-color);
        outline-offset: 0px;
    }

    .search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        height: 1.25rem;
        width: 1.25rem;
        color: #9ca3af;
    }

    /* 3. RIGHT GROUP */
    .nav-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        order: 3;
    }

    @media (min-width: 1024px) {
        .nav-right {
            gap: 1rem;
        }
    }

    /* Desktop Links (Hidden on small) */
    .desktop-links {
        display: none;
    }

    @media (min-width: 1024px) {
        .desktop-links {
            display: flex;
            gap: 1rem;
        }
    }

    .nav-link {
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        font-weight: 500;
        color: #4b5563;
        transition: all 150ms ease-in-out;
        text-decoration: none;
    }

    .nav-link:hover {
        color: var(--primary-color);
    }

    .deal-link {
        color: var(--red-color);
        font-weight: 700;
    }

    .deal-link:hover {
        color: #cf3737;
    }

    /* Action Icons (Sign In, Cart) */
    .icon-24 {
        height: 1.5rem;
        width: 1.5rem;
    }

    .action-icon {
        position: relative;
        padding: 0.5rem;
        border-radius: 0.5rem;
        color: #4b5563;
        transition: all 150ms ease-in-out;
        display: flex;
        align-items: center;
    }

    .action-icon:hover {
        background-color: var(--primary-light);
        color: var(--primary-color);
    }

    /* Cart Badge */
    .cart-badge {
        position: absolute;
        top: 0;
        right: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1;
        transform: translate(50%, -50%);
        background-color: var(--red-color);
        color: white;
        border-radius: 9999px;
    }

    /* --- MOBILE MENU DRAWER --- */
    .mobile-menu-drawer {
        border-top: 1px solid rgba(238, 242, 255, 0.5);
        padding-bottom: 0.75rem;
    }

    .mobile-links-container {
        padding: 0.5rem;
    }

    @media (min-width: 640px) {
        .mobile-links-container {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
        }
    }

    .mobile-nav-link {
        display: block;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 1rem;
        font-weight: 500;
        color: var(--text-color);
        transition: all 150ms ease-in-out;
        text-decoration: none;
    }

    .mobile-nav-link:hover {
        background-color: var(--primary-light);
        color: var(--primary-color);
    }

    /* Additional styles for content placeholder */
    .content-area {
        padding: 2rem;
    }

    .content-area h1 {
        font-size: 1.875rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 1rem;
    }

    .content-area p {
        color: #4b5563;
        margin-bottom: 1.5rem;
    }

    .hero-section {
        height: 24rem;
        background-color: #eef2ff;
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .hero-section p {
        color: #4338ca;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .product-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .product-card {
        height: 8rem;
        background-color: white;
        padding: 1rem;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
  `]
})
export class Trial implements OnInit {
  // Navigation Links array
  readonly navLinks: NavLink[] = [
    { label: 'TVs', link: '/shop/tvs' },
    { label: 'Accessories', link: '/shop/accessories' },
    { label: 'TV Cards', link: '/shop/tv-cards' },
    { label: 'Deals', link: '/sale' },
    { label: 'Support', link: '/support' },
    { label: 'Sign in', link: '/login' },
    { label: 'Cart', link: '/cart' },
  ];

  // Links specifically for the desktop view (excludes Sign In and Cart, which are icons)
  mainNavLinks: NavLink[] = [];
  // Links for the mobile drawer (includes Sign In and Cart for full navigation)
  mobileNavLinks: NavLink[] = [];

  // State signal for mobile menu visibility
  isMobileMenuOpen = signal(false);

  ngOnInit() {
    // Separate links for desktop bar vs. mobile drawer for cleaner rendering
    this.mainNavLinks = this.navLinks.filter(
        link => link.label !== 'Sign in' && link.label !== 'Cart'
    );
    this.mobileNavLinks = this.navLinks;
  }

  /**
   * Toggles the mobile menu state.
   */
  toggleMenu(): void {
    this.isMobileMenuOpen.update(current => !current);
  }

  /**
   * Closes the mobile menu if the window is resized to desktop size (lg breakpoint: 1024px).
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    // 1024px is the equivalent of the Tailwind 'lg' breakpoint
    if (window.innerWidth >= 1024 && this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }
}
=======
import { Component, signal, OnInit, HostListener } from '@angular/core';

// Define the navigation link structure
interface NavLink {
  label: string;
  link: string;
}

@Component({
  selector: 'app-trial',
  standalone: false,
  template: `
    <!--
      NAVIGATION BAR (STICKY)
      Uses custom classes for styling and responsiveness defined in the 'styles' array below.
    -->
    <nav class="navbar" [class.menu-open]="isMobileMenuOpen()">
      <div class="nav-container">
        <!-- Main Header Row -->
        <div class="nav-header">

          <!-- 1. LEFT GROUP: Mobile Menu Button & Brand Logo -->
          <div class="nav-left">
            <!-- Mobile Menu Button (Hamburger) - Visible on small devices -->
            <button (click)="toggleMenu()" type="button" aria-controls="mobile-menu"
                    [attr.aria-expanded]="isMobileMenuOpen()"
                    class="menu-toggle">

              @if (!isMobileMenuOpen()) {
                <!-- Menu Icon (Hamburger) -->
                <svg class="icon-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              } @else {
                <!-- Close Icon (X) -->
                <svg class="icon-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            </button>
            <!-- Brand Logo/Name -->
            <a href="/" class="brand-logo">TechShop</a>
          </div>

          <!-- 2. CENTER GROUP: Search Input -->
          <div class="search-container">
            <div class="search-wrapper">
              <input type="search" placeholder="Search for products..."
                    class="search-input">
              <!-- Search Icon -->
              <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- 3. RIGHT GROUP: Desktop Links & Mobile/Desktop Actions -->
          <div class="nav-right">

            <!-- Desktop Navigation Links (Hidden on small, shown on large) -->
            <div class="desktop-links">
              @for (nav of mainNavLinks; track nav.label) {
                <a [href]="nav.link"
                  class="nav-link"
                  [class.deal-link]="nav.label === 'Deals'">
                  {{ nav.label }}
                </a>
              }
            </div>

            <!-- Action Icons (Sign In & Cart) - Always visible -->
            <a href="/login" title="Sign in" class="action-icon">
              <!-- User Icon -->
              <svg class="icon-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span class="sr-only">Sign in</span>
            </a>
            <a href="/cart" title="Cart" class="action-icon cart-icon-wrapper">
              <!-- Shopping Cart Icon -->
              <svg class="icon-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span class="sr-only">Cart</span>
              <!-- Cart Count Badge -->
              <span class="cart-badge">3</span>
            </a>
          </div>
        </div>

        <!-- Mobile Menu Drawer (Toggled by the isMobileMenuOpen signal) -->
        @if (isMobileMenuOpen()) {
          <div id="mobile-menu" class="mobile-menu-drawer">
            <div class="mobile-links-container">
              @for (nav of mobileNavLinks; track nav.label) {
                <a [href]="nav.link"
                  class="mobile-nav-link"
                  [class.deal-link]="nav.label === 'Deals'">
                  {{ nav.label }}
                </a>
              }
            </div>
          </div>
        }
      </div>
    </nav>

    <!-- Content Placeholder -->
    <div class="content-area">
      <h1>E-commerce Landing Page Content (Pure CSS)</h1>
      <p>Scroll down to see the sticky navigation bar in action!</p>
      <div class="hero-section">
          <p>Hero Section / Promotional Banner</p>
      </div>
      <!-- Generate some long content to enable scrolling -->
      <div class="product-grid">
          @for (item of [1,2,3,4,5,6,7,8,9,10]; track item) {
              <div class="product-card">Product Category {{ item }}</div>
          }
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

    /* Variable approximations */
    :root {
      --primary-color: #4f46e5; /* indigo-600 */
      --primary-light: #eef2ff; /* indigo-50 */
      --red-color: #ef4444; /* red-500 */
      --text-color: #374151; /* gray-700 */
      --header-height: 4rem;
    }

    /* Base Styles */
    :host {
        display: block;
    }

    body {
        font-family: 'Inter', sans-serif;
        background-color: #f3f4f6;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }

    /* --- NAVBAR STYLES --- */
    .navbar {
        position: sticky;
        top: 0;
        z-index: 500;
        background-color: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid rgba(238, 242, 255, 0.5);
        transition: background-color 0.3s ease;
    }

    .nav-container {
        max-width: 80rem;
        margin-left: auto;
        margin-right: auto;
        padding-left: 1rem;
        padding-right: 1rem;
    }

    @media (min-width: 640px) {
        .nav-container {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
        }
    }
    @media (min-width: 1024px) {
        .nav-container {
            padding-left: 2rem;
            padding-right: 2rem;
        }
    }

    .nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: var(--header-height);
    }

    /* 1. LEFT GROUP */
    .nav-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .menu-toggle {
        padding: 0.5rem;
        border-radius: 0.5rem;
        color: #4b5563;
        transition: all 150ms ease-in-out;
        border: none;
        background: transparent;
        cursor: pointer;
    }

    .menu-toggle:hover {
        background-color: var(--primary-light);
        color: var(--primary-color);
    }

    @media (min-width: 1024px) {
        .menu-toggle {
            display: none;
        }
    }

    .brand-logo {
        font-size: 1.25rem;
        font-weight: 900;
        color: var(--primary-color);
        letter-spacing: -0.025em;
    }

    @media (min-width: 640px) {
        .brand-logo {
            font-size: 1.5rem;
        }
    }

    /* 2. CENTER GROUP: Search */
    .search-container {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        order: 2;
        margin-left: 0.5rem;
        margin-right: 0.5rem;
    }

    @media (min-width: 640px) {
        .search-container {
            margin-left: 1rem;
            margin-right: 1rem;
        }
    }

    @media (min-width: 1024px) {
        .search-container {
            flex-grow: 0;
            max-width: 28rem;
            margin-left: 0;
            margin-right: 0;
        }
    }

    .search-wrapper {
        position: relative;
        width: 100%;
    }

    .search-input {
        width: 100%;
        padding: 0.5rem 1rem 0.5rem 2.5rem;
        font-size: 0.875rem;
        border: 1px solid #d1d5db;
        border-radius: 0.75rem;
        transition: all 150ms ease-in-out;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    .search-input:focus {
        border-color: var(--primary-color);
        outline: 2px solid var(--primary-color);
        outline-offset: 0px;
    }

    .search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        height: 1.25rem;
        width: 1.25rem;
        color: #9ca3af;
    }

    /* 3. RIGHT GROUP */
    .nav-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        order: 3;
    }

    @media (min-width: 1024px) {
        .nav-right {
            gap: 1rem;
        }
    }

    /* Desktop Links (Hidden on small) */
    .desktop-links {
        display: none;
    }

    @media (min-width: 1024px) {
        .desktop-links {
            display: flex;
            gap: 1rem;
        }
    }

    .nav-link {
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        font-weight: 500;
        color: #4b5563;
        transition: all 150ms ease-in-out;
        text-decoration: none;
    }

    .nav-link:hover {
        color: var(--primary-color);
    }

    .deal-link {
        color: var(--red-color);
        font-weight: 700;
    }

    .deal-link:hover {
        color: #cf3737;
    }

    /* Action Icons (Sign In, Cart) */
    .icon-24 {
        height: 1.5rem;
        width: 1.5rem;
    }

    .action-icon {
        position: relative;
        padding: 0.5rem;
        border-radius: 0.5rem;
        color: #4b5563;
        transition: all 150ms ease-in-out;
        display: flex;
        align-items: center;
    }

    .action-icon:hover {
        background-color: var(--primary-light);
        color: var(--primary-color);
    }

    /* Cart Badge */
    .cart-badge {
        position: absolute;
        top: 0;
        right: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1;
        transform: translate(50%, -50%);
        background-color: var(--red-color);
        color: white;
        border-radius: 9999px;
    }

    /* --- MOBILE MENU DRAWER --- */
    .mobile-menu-drawer {
        border-top: 1px solid rgba(238, 242, 255, 0.5);
        padding-bottom: 0.75rem;
    }

    .mobile-links-container {
        padding: 0.5rem;
    }

    @media (min-width: 640px) {
        .mobile-links-container {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
        }
    }

    .mobile-nav-link {
        display: block;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 1rem;
        font-weight: 500;
        color: var(--text-color);
        transition: all 150ms ease-in-out;
        text-decoration: none;
    }

    .mobile-nav-link:hover {
        background-color: var(--primary-light);
        color: var(--primary-color);
    }

    /* Additional styles for content placeholder */
    .content-area {
        padding: 2rem;
    }

    .content-area h1 {
        font-size: 1.875rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 1rem;
    }

    .content-area p {
        color: #4b5563;
        margin-bottom: 1.5rem;
    }

    .hero-section {
        height: 24rem;
        background-color: #eef2ff;
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .hero-section p {
        color: #4338ca;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .product-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .product-card {
        height: 8rem;
        background-color: white;
        padding: 1rem;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
  `]
})
export class Trial implements OnInit {
  // Navigation Links array
  readonly navLinks: NavLink[] = [
    { label: 'TVs', link: '/shop/tvs' },
    { label: 'Accessories', link: '/shop/accessories' },
    { label: 'TV Cards', link: '/shop/tv-cards' },
    { label: 'Deals', link: '/sale' },
    { label: 'Support', link: '/support' },
    { label: 'Sign in', link: '/login' },
    { label: 'Cart', link: '/cart' },
  ];

  // Links specifically for the desktop view (excludes Sign In and Cart, which are icons)
  mainNavLinks: NavLink[] = [];
  // Links for the mobile drawer (includes Sign In and Cart for full navigation)
  mobileNavLinks: NavLink[] = [];

  // State signal for mobile menu visibility
  isMobileMenuOpen = signal(false);

  ngOnInit() {
    // Separate links for desktop bar vs. mobile drawer for cleaner rendering
    this.mainNavLinks = this.navLinks.filter(
        link => link.label !== 'Sign in' && link.label !== 'Cart'
    );
    this.mobileNavLinks = this.navLinks;
  }

  /**
   * Toggles the mobile menu state.
   */
  toggleMenu(): void {
    this.isMobileMenuOpen.update(current => !current);
  }

  /**
   * Closes the mobile menu if the window is resized to desktop size (lg breakpoint: 1024px).
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    // 1024px is the equivalent of the Tailwind 'lg' breakpoint
    if (window.innerWidth >= 1024 && this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }
}
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
