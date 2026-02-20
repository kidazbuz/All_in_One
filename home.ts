import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';



// --- Interface for simplified product display (based on API results) ---
interface ProductListItem {
  id: number;
  name: string;
  brand_name: string;
  min_sale_price: number;
  original_price: number;
  rating: number;
  reviewsCount: number;
  image_url: string;
  screen_size_name: string;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html', // Now contains the catalog view
  styleUrl: './home.scss', // Now contains all catalog styling
})
export class Home {

  // Static data for top navigation links
  navLinks = [
    { label: 'TVs', link: '/shop/tvs' },
    { label: 'Accessories', link: '/shop/accessories' },
    { label: 'TV Cards', link: '/shop/tv-cards' },
    { label: 'Deals', link: '/sale' },
    { label: 'Support', link: '/support' },
  ];

  // Static data for main categories (now TV focused)
  categories = [
    { name: 'QLED & OLED', image: 'https://picsum.photos/id/431/400/300', link: '/shop/premium' },
    { name: 'Soundbars & Audio', image: 'https://picsum.photos/id/257/400/300', link: '/shop/audio' },
    { name: '4K Smart TVs', image: 'https://picsum.photos/id/214/400/300', link: '/shop/4k-smart' },
    { name: 'Mounts & Remotes', image: 'https://picsum.photos/id/272/400/300', link: '/shop/accessories' },
  ];

  // Sample Featured Products (Best Sellers)
  featuredProducts = [
    {
      name: '55" OLED Smart TV', price: 1799.00, rating: 4.8,
      image: 'https://picsum.photos/id/194/300/200',
      moreImages: ['img1.jpg', 'img2.jpg'],
      videoLink: 'https://youtube.com/product_video_1'
    },
    {
      name: 'Premium Soundbar 5.1', price: 499.00, rating: 4.6,
      image: 'https://picsum.photos/id/180/300/200',
      moreImages: ['img3.jpg'],
      videoLink: null
    },
    {
      name: 'HDMI 2.1 Cable Pack', price: 49.00, rating: 4.9,
      image: 'https://picsum.photos/id/237/300/200',
      moreImages: [],
      videoLink: null
    },
  ];

  // Filtering options for the side navigation (simulated for the homepage)
  filterOptions = [
    { group: 'Technology', values: ['OLED', 'QLED', 'LED', '4K', '8K'] },
    { group: 'Screen Size', values: ['< 40"', '40" - 55"', '55" - 70"', '> 70"'] },
    { group: 'Special Features', values: ['Gaming Mode', 'Voice Control', 'Smart Hub'] },
  ];

  // Dynamic properties (Timer/Trust Bar data remain, omitted for brevity)
  trustFeatures = [
    { icon: '📺', text: '5-Year Warranty', detail: 'On all TV sets' },
    { icon: '⭐', text: '4.8/5 Star Rating', detail: 'From 1,200+ Buyers' },
    { icon: '💳', text: '0% Financing', detail: 'On orders over $500' },
    { icon: '🛠️', text: 'Wall Mount Service', detail: 'Installation upon delivery' },
  ];

  // Side nav state
  isSideNavOpen: boolean = false;

  toggleSideNav() {
    this.isSideNavOpen = !this.isSideNavOpen;
  }

}



<main class="home-page">
    <header class="top-nav">
        <div class="nav-brand">SSEAMS 📺</div>
        <nav class="nav-links-desktop">
            <a *ngFor="let link of navLinks" [href]="link.link">{{ link.label }}</a>
        </nav>
        <div class="nav-actions">
            <input type="text" placeholder="Search TVs & Accessories..." class="search-input">
            <a href="/cart" class="cart-icon">🛒</a>
            <button class="menu-toggle" (click)="toggleSideNav()">☰</button>
        </div>
    </header>

    <aside class="side-nav" [class.open]="isSideNavOpen">
        <button class="close-btn" (click)="toggleSideNav()">✕</button>
        <h3>Browse & Filter</h3>
        <div *ngFor="let filter of filterOptions" class="filter-group">
            <h4>{{ filter.group }}</h4>
            <label *ngFor="let value of filter.values" class="filter-option">
                <input type="checkbox" [value]="value"> {{ value }}
            </label>
        </div>
        <a href="/shop" class="apply-filter-btn">Apply Filters</a>
    </aside>

    <div class="overlay" [class.active]="isSideNavOpen" (click)="toggleSideNav()"></div>

    <section class="hero-section" style="background-image: url('https://picsum.photos/id/157/1400/800')">
        </section>

    <section class="trust-bar">
        <div *ngFor="let feature of trustFeatures" class="trust-item">
            <span class="trust-icon">{{ feature.icon }}</span>
            <div class="trust-text">
                <strong>{{ feature.text }}</strong>
                <span>{{ feature.detail }}</span>
            </div>
        </div>
    </section>

    <section class="category-blocks">
        <h2>Find Your Perfect View</h2>
        <div class="category-grid">
            <a *ngFor="let cat of categories" [href]="cat.link" class="category-card">
                <img [src]="cat.image" [alt]="cat.name" loading="lazy">
                <h3>{{ cat.name }}</h3>
            </a>
        </div>
    </section>

    <section class="featured-products">
        <h2>Top Rated TVs & Accessories</h2>
        <div class="product-grid">
            <div *ngFor="let product of featuredProducts" class="product-card">
                <img [src]="product.image" [alt]="product.name" loading="lazy">
                <div class="product-info">
                    <p class="name">{{ product.name }}</p>
                    <div class="rating">⭐⭐⭐⭐<span> ({{ product.rating }})</span></div>
                    <p class="price">${{ product.price | number:'1.2-2' }}</p>

                    <div class="media-links">
                        <a *ngIf="product.moreImages.length > 0" href="#" class="media-btn">🖼️ {{ product.moreImages.length }} Photos</a>
                        <a *ngIf="product.videoLink" [href]="product.videoLink" target="_blank" class="media-btn video-btn">▶️ Video Review</a>
                    </div>

                    <button class="add-to-cart-btn">Add to Cart</button>
                </div>
            </div>
        </div>
    </section>

    </main>



    // Variables
    $primary-color: #0a40a0; // Strong Blue
    $secondary-color: #ff5722; // Orange (Action)
    $background-light: #f4f7f9;
    $text-dark: #333;
    $max-width: 1400px;
    $side-nav-width: 280px;

    // Base styles for the page wrapper
    .home-page {
        width: 100%;
        margin: 0 auto;
        max-width: $max-width;
    }

    // --- 1. TOP NAVIGATION STYLES ---
    .top-nav {
        background-color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 15px 5%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .nav-brand {
            font-size: 1.5rem;
            font-weight: bold;
            color: $primary-color;
        }

        .nav-links-desktop {
            @media (max-width: 992px) {
                display: none; // Hide on mobile/tablet
            }
            a {
                text-decoration: none;
                color: $text-dark;
                margin-left: 25px;
                font-weight: 500;
                transition: color 0.2s;
                &:hover { color: $primary-color; }
            }
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 15px;

            .search-input {
                padding: 8px 15px;
                border: 1px solid #ddd;
                border-radius: 50px;
                width: 200px;
                @media (max-width: 600px) {
                    display: none; // Hide search bar on small screen
                }
            }

            .cart-icon {
                font-size: 1.4rem;
                text-decoration: none;
                color: $text-dark;
            }

            .menu-toggle {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                display: none;
                @media (max-width: 992px) {
                    display: block; // Show toggle on mobile/tablet
                }
            }
        }
    }

    // --- 2. SIDE NAVIGATION (FILTER BAR) STYLES ---
    .side-nav {
        position: fixed;
        top: 0;
        right: 0;
        width: $side-nav-width;
        height: 100%;
        background-color: white;
        box-shadow: -4px 0 15px rgba(0, 0, 0, 0.15);
        transform: translateX($side-nav-width); /* Initially hidden */
        transition: transform 0.3s ease-in-out;
        padding: 20px;
        z-index: 1000;
        overflow-y: auto;

        &.open {
            transform: translateX(0); /* Slides open */
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
        }

        h3 { margin-top: 30px; color: $primary-color; }

        .filter-group {
            margin-top: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;

            h4 {
                font-size: 1rem;
                margin-bottom: 10px;
                font-weight: bold;
            }
            .filter-option {
                display: block;
                font-size: 0.95rem;
                margin-bottom: 5px;
                input[type="checkbox"] {
                    margin-right: 8px;
                }
            }
        }

        .apply-filter-btn {
            display: block;
            text-align: center;
            background-color: $secondary-color;
            color: white;
            padding: 10px;
            border-radius: 4px;
            text-decoration: none;
            margin-top: 20px;
            &:hover { background-color: darken($secondary-color, 10%); }
        }
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.3s, visibility 0.3s;

        &.active {
            visibility: visible;
            opacity: 1;
        }
    }

    // --- 3. TRUST BAR (Updated Icons/Colors) ---
    .trust-bar {
        // ... (Trust bar styles similar to previous example)
        background-color: $background-light;
        padding: 20px 5%;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        border-bottom: 1px solid #ddd;
        @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); text-align: center; }
    }

    // --- 4. CATEGORY BLOCKS (TV Focused) ---
    .category-blocks {
        padding: 50px 5%;
        text-align: center;
        h2 { margin-bottom: 30px; color: $text-dark; }
        .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            // ... (Category card styles similar to previous example)
        }
    }

    // --- 5. FEATURED PRODUCTS (Enhanced View) ---
    .featured-products {
        background-color: $background-light;
        padding: 50px 5%;
        // ... (Product grid styles similar to previous example)

        .product-card {
            // ... (Product card base styles)

            .media-links {
                display: flex;
                gap: 10px;
                margin: 10px 0;
            }

            .media-btn {
                display: inline-block;
                text-decoration: none;
                font-size: 0.9rem;
                padding: 5px 10px;
                border-radius: 50px;
                color: $primary-color;
                border: 1px solid $primary-color;
                transition: background-color 0.2s;

                &:hover {
                    background-color: $primary-color;
                    color: white;
                }
            }

            .video-btn {
                color: $secondary-color;
                border-color: $secondary-color;
                &:hover {
                    background-color: $secondary-color;
                    color: white;
                }
            }

            .add-to-cart-btn {
                margin-top: 15px; /* Added space for new media links */
                // ... (CTA styles)
            }
        }
    }
