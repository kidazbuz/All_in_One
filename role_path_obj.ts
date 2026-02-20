// src/app/core/interfaces/menu-item.interface.ts

export interface MenuItem {
  path: string;
  title: string;
}


// src/app/core/constants/role-menu-paths.constant.ts

import { MenuItem } from '../interfaces/menu-item.interface';

/**
 * Maps user roles (keys) to an array of authorized MenuItem objects (values).
 * This structure is the Single Source of Truth for menu generation and client-side route guards.
 */
export const ROLE_MENU_PATHS: { [key: string]: MenuItem[] } = {
  // ------------------------------------
  // 1. SYSTEM & EXECUTIVE ROLES
  // ------------------------------------
  "System Administrator": [
    { path: "/admin/settings", title: "System Configuration" },
    { path: "/admin/users", title: "User Management" },
    { path: "/admin/audit", title: "Security & Audit Logs" },
  ],
  "Executive Manager": [
    { path: "/dashboard/executive", title: "Executive Overview" },
    { path: "/reports/metrics/performance", title: "KPMs & Performance" },
    { path: "/reports/pnl", title: "Financial Summary" },
  ],
  "Financial Controller": [
    { path: "/finance/accounts-receivable", title: "A/R & A/P Management" },
    { path: "/finance/payments/audit", title: "Payment Reconciliation" },
    { path: "/reports/financial", title: "General Ledger Access" },
  ],
  "Reporting Analyst": [
    { path: "/reports/data-export", title: "Data Export Tool" },
    { path: "/reports/analytics/builder", title: "Report Builder" },
    { path: "/dashboard/reports", title: "Saved Reports View" },
  ],

  // ------------------------------------
  // 2. SALES & SUPPLY CHAIN ROLES
  // ------------------------------------
  "Sales Representative": [
    { path: "/sales/orders/new", title: "New Sales Order" },
    { path: "/sales/orders/list", title: "Open Orders" },
    { path: "/sales/customers/reviews", title: "Product/Review Moderation" },
  ],
  "Purchasing Agent": [
    { path: "/inventory/purchase-orders/new", title: "Create Purchase Order" },
    { path: "/suppliers", title: "Supplier Management" },
    { path: "/inventory/po/pending", title: "Pending POs" },
  ],
  "Warehouse/Logistics Manager": [
    { path: "/inventory/shipments/queue", title: "Shipping Queue" },
    { path: "/inventory/stock-view", title: "Stock Levels" },
    { path: "/inventory/receipts/new", title: "Receive Goods" },
  ],

  // ------------------------------------
  // 3. REPAIR & SERVICE ROLES
  // ------------------------------------
  "Front Desk / Service Agent": [
    { path: "/service/tickets/new", title: "Log New Service Ticket" },
    { path: "/service/tickets/search", title: "Search Tickets" },
    { path: "/service/scheduling", title: "Appointment Scheduling" },
  ],
  "Repair Technician": [
    { path: "/service/tickets/my-queue", title: "My Job Queue" },
    { path: "/service/ticket/update", title: "Update Job Progress" },
    { path: "/service/inventory/parts", title: "Parts Request" },
  ],
  "Service Manager": [
    { path: "/service/tickets/all", title: "All Service Tickets" },
    { path: "/service/technicians/performance", title: "Tech Performance" },
    { path: "/service/tickets/approvals", title: "Quote Approvals" },
  ],

  // ------------------------------------
  // 4. DIGITAL CONTENT & CUSTOMER ROLES
  // ------------------------------------
  "Content Creator / Author": [
    { path: "/content/video/upload", title: "Upload New Video" },
    { path: "/content/video/drafts", title: "My Drafts" },
    { path: "/content/dashboard", title: "Creator Dashboard" },
  ],
  "Content Editor / Reviewer": [
    { path: "/content/video/review-queue", title: "Content Review Queue" },
    { path: "/content/review/moderation", title: "Content Review Moderation" },
    { path: "/content/video/published", title: "Manage Published" },
  ],
  "Customer": [
    { path: "/my/orders", title: "My Orders & Tracking" },
    { path: "/my/video-library", title: "My Purchased Videos" },
    { path: "/my/wishlist", title: "My Wishlist" },
    { path: "/my/reviews", title: "My Product Reviews" },
    { path: "/content/video/search", title: "Browse Content" },
    { path: "/my/profile/licenses", title: "Manage Licenses" },
  ],
};


// src/app/core/services/menu.service.ts

import { Injectable } from '@angular/core';
import { ROLE_MENU_PATHS } from '../constants/role-menu-paths.constant';
import { MenuItem } from '../interfaces/menu-item.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor() { }

  /**
   * Retrieves the authorized menu items for a given user role.
   * @param userRole The role string (e.g., "Financial Controller")
   * @returns An array of MenuItem objects.
   */
  getAuthorizedMenu(userRole: string): MenuItem[] {
    // Look up the role in the constant map. If the role is not found, return an empty array.
    return ROLE_MENU_PATHS[userRole] ?? [];
  }

  /**
   * Checks if a user is authorized to access a specific path.
   * Useful for client-side component/button visibility.
   * @param userRole The user's role.
   * @param path The path to check (e.g., "/admin/settings").
   * @returns boolean
   */
  isPathAuthorized(userRole: string, path: string): boolean {
    const authorizedPaths = this.getAuthorizedMenu(userRole);
    return authorizedPaths.some(item => item.path === path);
  }
}
