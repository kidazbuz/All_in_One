// Assuming your component is named HomeComponent
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html', // Now contains the catalog view
  styleUrl: './home.scss', // Now contains all catalog styling
})

export class Home {
  isSideNavOpen: boolean = false;

  toggleSideNav(): void {
    this.isSideNavOpen = !this.isSideNavOpen;
  }

  // --- DATA MODELS ---

  navLinks = [
    { label: '📺 TVs', link: '/shop/tvs' },
    { label: '⚙️ Gear', link: '/shop/accessories' },
    { label: '💾 Cards', link: '/shop/tv-cards' },
    { label: '🔥 Deals', link: '/sale' },
    { label: '🆘 Help', link: '/support' },
    { label: '👤 Log In', link: '/login', class: 'login-link' },
  ];

  filterOptions = [
    { group: 'Technology', values: ['OLED', 'QLED', 'Mini-LED', '4K', '8K'] },
    { group: 'Screen Size', values: ['< 40"', '40" - 55"', '55" - 70"', '> 70"'] },
    { group: 'Features', values: ['Gaming Ready', 'Voice Control', 'Smart Hub', 'Built-in Soundbar'] },
  ];

  // Products with rich, imaginary data and live placeholder image links
  allProducts = [
    {
      name: 'The Cinematic 65" OLED',
      description: 'Stunning 4K OLED display with infinite contrast. Perfect for movies and serious gaming.',
      price: 1999.00,
      rating: 4.8,
      stock: 12,
      image: 'https://picsum.photos/id/194/400/300', // Online Image Placeholder
      imagesCount: 5,
      videoLink: 'https://youtube.com/product_video_1' // Imaginary video link
    },
    {
      name: 'The Gaming Pro 50" QLED',
      description: '120Hz refresh rate, low input lag, and QLED brightness. Best TV for console players.',
      price: 899.00,
      rating: 4.7,
      stock: 5, // Low stock item
      image: 'https://picsum.photos/id/165/400/300',
      imagesCount: 3,
      videoLink: 'https://youtube.com/product_video_2'
    },
    {
      name: 'Sound Master 7.1 Soundbar',
      description: 'Wireless subwoofer and rear speakers included. Experience truly immersive Dolby Atmos.',
      price: 599.00,
      rating: 4.6,
      stock: 35,
      image: 'https://picsum.photos/id/237/400/300',
      imagesCount: 2,
      videoLink: null // No video link
    },
    {
      name: 'Ultra-Flex Wall Mount (70"+)',
      description: 'Heavy-duty steel mount, supports up to 100kg. Full motion swivel and tilt.',
      price: 79.00,
      rating: 4.9,
      stock: 88,
      image: 'https://picsum.photos/id/1080/400/300',
      imagesCount: 1,
      videoLink: null
    },
  ];
}



<header class="top-nav">
    <div class="nav-brand">📺 SSEAMS</div>

    <nav class="nav-links-desktop">
        <a *ngFor="let link of navLinks" [routerLink]="link.link" [ngClass]="link.class">{{ link.label }}</a>
    </nav>

    <div class="nav-actions">
        <input type="search" placeholder="Search TVs & Accessories..." class="search-input">
        <a routerLink="/cart" class="cart-icon">🛒</a>
        <button class="menu-toggle" (click)="toggleSideNav()">☰</button>
    </div>
</header>

<div class="layout-container">

    <aside class="side-nav" [class.open]="isSideNavOpen">
        <button class="close-btn" (click)="toggleSideNav()">✕</button>

        <h3>Browse & Filter</h3>

        <div *ngFor="let filter of filterOptions" class="filter-group">
            <h4>{{ filter.group }}</h4>
            <label *ngFor="let value of filter.values" class="filter-option">
                <input type="checkbox" [value]="value"> {{ value }}
            </label>
        </div>

        <a routerLink="/shop" class="apply-filter-btn">Apply Filters</a>
    </aside>

    <div class="overlay" [class.active]="isSideNavOpen" (click)="toggleSideNav()"></div>

    <main class="main-content">

        <section class="hero-section" style="background-image: url('https://images.unsplash.com/photo-1616259021644-80975e533c39?q=80&w=1400&h=500&fit=crop');">
            <div class="hero-content">
                <h1>Your New View Awaits.</h1>
                <p>Upgrade to a giant screen with stunning color and clarity. Free 5-year warranty on all models!</p>
                <a routerLink="/sale" class="cta-button">See 8K Deals →</a>
            </div>
        </section>

        <section class="product-listing">
            <h2>All Products in Stock</h2>
            <div class="product-grid">

                <div *ngFor="let product of allProducts" class="product-card">
                    <div class="product-image-container">
                        <img [src]="product.image" [alt]="product.name" loading="lazy">
                        <span class="stock-badge" [class.low-stock]="product.stock < 10">
                            Stock: **{{ product.stock }}**
                        </span>
                    </div>

                    <div class="product-info">
                        <h3 class="name">{{ product.name }}</h3>
                        <p class="description">{{ product.description }}</p>

                        <div class="price-rating">
                            <p class="price">${{ product.price | number:'1.2-2' }}</p>
                            <div class="rating">⭐⭐⭐⭐<span> ({{ product.rating }})</span></div>
                        </div>

                        <div class="media-links">
                            <a *ngIf="product.imagesCount > 0" href="#" class="media-btn">🖼️ {{ product.imagesCount }} Photos</a>
                            <a *ngIf="product.videoLink" [href]="product.videoLink" target="_blank" class="media-btn video-btn">▶️ Video</a>
                        </div>

                        <button class="add-to-cart-btn">Add to Cart</button>
                    </div>
                </div>
            </div>
        </section>
    </main>
</div>

<footer class="footer">
    <p>Your TV Experts | SSEAMS &copy; 2025. All rights reserved.</p>
    <div class="footer-links">
        <a routerLink="/privacy">Privacy Policy</a> |
        <a routerLink="/returns">Returns & Exchange</a> |
        <a routerLink="/contact">Contact Us</a>
    </div>
</footer>


// Variables
$primary-color: #0a40a0; // Deep Blue (Tech/Trust)
$secondary-color: #e62e00; // Deep Red (Action/Deals)
$background-light: #f4f7f9;
$text-dark: #333;
$side-nav-width-desktop: 250px;
$max-width-content: 1400px;
$breakpoint-desktop: 993px;

// --- 1. TOP NAVIGATION STYLES ---
.top-nav {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 15px 5%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 500;

    .nav-brand {
        font-size: 1.5rem;
        font-weight: bold;
        color: $primary-color;
    }
    .nav-links-desktop {
        display: flex;
        gap: 25px;
        @media (max-width: $breakpoint-desktop - 1) {
            display: none;
        }
    }
    .login-link {
        font-weight: bold;
        color: $secondary-color;
        border: 1px solid $secondary-color;
        padding: 5px 10px;
        border-radius: 4px;
        text-decoration: none;
    }
    .nav-actions {
        display: flex;
        align-items: center;
        gap: 15px;
        .menu-toggle {
            display: none;
            @media (max-width: $breakpoint-desktop - 1) {
                display: block;
                background: none; border: none; font-size: 1.5rem; cursor: pointer;
            }
        }
    }
}

// --- 2. SIDE NAVIGATION (LAYOUT SHIFT LOGIC) ---
.layout-container {
    max-width: $max-width-content;
    margin: 0 auto;
    width: 100%;

    @media (min-width: $breakpoint-desktop) {
        display: grid;
        grid-template-columns: $side-nav-width-desktop 1fr; /* Desktop: Split view */
    }
}

/* SIDE NAVIGATION STYLES */
.side-nav {
    padding: 20px;
    background-color: $background-light;

    /* Desktop (Always visible on the left, sticky) */
    @media (min-width: $breakpoint-desktop) {
        position: sticky;
        top: 60px;
        min-height: calc(100vh - 60px);
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
        z-index: 10;
        .close-btn { display: none; }
    }

    /* Mobile (Slide-out from the left) */
    @media (max-width: $breakpoint-desktop - 1) {
        position: fixed;
        left: 0;
        top: 0;
        height: 100%;
        width: $side-nav-width-desktop;
        z-index: 1000;
        box-shadow: 4px 0 15px rgba(0, 0, 0, 0.15);
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;

        &.open {
            transform: translateX(0); /* Slides into view */
        }

        .close-btn {
            display: block;
            background: none; border: none; font-size: 1.5rem;
            position: absolute; top: 10px; right: 10px; cursor: pointer;
        }
    }

    h3 { margin-top: 10px; color: $primary-color; }
    .filter-group {
        margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;
        h4 { font-size: 1rem; margin-bottom: 10px; font-weight: bold;}
        .filter-option { display: block; font-size: 0.95rem; margin-bottom: 5px; }
    }
    .apply-filter-btn {
        display: block; text-align: center; background-color: $secondary-color;
        color: white; padding: 10px; border-radius: 4px; text-decoration: none;
        margin-top: 20px;
        &:hover { background-color: darken($secondary-color, 10%); }
    }
}

.overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5); z-index: 999;
    visibility: hidden; opacity: 0; transition: opacity 0.3s, visibility 0.3s;

    &.active { visibility: visible; opacity: 1; }

    @media (min-width: $breakpoint-desktop) { display: none; }
}

/* MAIN CONTENT AREA */
.main-content {
    flex-grow: 1;
    padding: 0 5%;
    min-height: calc(100vh - 60px);

    @media (max-width: $breakpoint-desktop - 1) {
        width: 100%;
    }
}

/* --- HERO SECTION --- */
.hero-section {
    position: relative;
    height: 35vh; /* Reduced height for better content visibility */
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 5%;
    margin-bottom: 40px;

    .hero-content {
        background-color: rgba(255, 255, 255, 0.9);
        padding: 20px;
        border-radius: 8px;
        max-width: 450px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

        h1 { font-size: 2rem; margin-bottom: 10px; color: $primary-color; }
        p { font-size: 1rem; margin-bottom: 15px; color: $text-dark; }
        .cta-button {
            display: inline-block; background-color: $secondary-color;
            color: white; padding: 10px 20px; border-radius: 50px; text-decoration: none;
            font-weight: bold; transition: background-color 0.3s;
            &:hover { background-color: darken($secondary-color, 10%); }
        }
    }
}

/* --- PRODUCT LISTING AREA --- */
.product-listing {
    padding-top: 20px;
    h2 { margin-bottom: 30px; color: $text-dark; }

    .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;

        @media (max-width: 600px) {
            grid-template-columns: 1fr;
        }

        .product-card {
            background: white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            overflow: hidden; text-align: left; transition: transform 0.2s;
            &:hover { transform: translateY(-3px); }

            .product-image-container {
                position: relative;
                img { width: 100%; height: 200px; object-fit: cover; display: block; }
                .stock-badge {
                    position: absolute; top: 10px; right: 10px; background-color: #4CAF50;
                    color: white; padding: 5px 10px; border-radius: 4px; font-size: 0.8rem;
                    &.low-stock { background-color: $secondary-color; }
                }
            }

            .product-info {
                padding: 15px;
                .name { font-weight: bold; font-size: 1.15rem; margin-bottom: 5px; }
                .description { font-size: 0.9rem; color: #666; margin-bottom: 10px; height: 3.2em; overflow: hidden; }

                .price-rating {
                    display: flex; justify-content: space-between; align-items: center; margin: 10px 0;
                    .price { font-size: 1.4rem; color: $secondary-color; font-weight: bold; }
                    .rating { color: gold; font-size: 0.9rem; span { color: #666; margin-left: 5px; } }
                }

                .media-links { margin-bottom: 15px; }
                .media-btn {
                    display: inline-block; text-decoration: none; font-size: 0.85rem; padding: 5px 10px;
                    border-radius: 50px; color: $primary-color; border: 1px solid $primary-color;
                    &:hover { background-color: $primary-color; color: white; }
                }
                .video-btn { color: $secondary-color; border-color: $secondary-color; }

                .add-to-cart-btn {
                    width: 100%; background-color: $primary-color; color: white; padding: 10px;
                    border: none; border-radius: 4px; cursor: pointer;
                    &:hover { background-color: darken($primary-color, 10%); }
                }
            }
        }
    }
}

/* --- 4. MINIMAL FOOTER --- */
.footer {
    background-color: $text-dark;
    color: white;
    padding: 20px 5%;
    text-align: center;
    font-size: 0.9rem;
    .footer-links {
        a { color: #ccc; text-decoration: none; margin: 0 10px; &:hover { color: $primary-color; } }
    }
}
