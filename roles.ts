<<<<<<< HEAD
// roles.ts

/**
 * @interface RoleDefinition
 * Defines the structure for each role in the unified system (SSEAMS + Juma + Video).
 * This structure is useful for routing, navigation display, and initial authorization checks.
 */
export interface RoleDefinition {
  /** The unique identifier for the role, matching the security policy. */
  role: string;
  /** The main dashboard or most frequently visited URL path for this role. */
  defaultPath: string;
  /** A human-readable title, often used in navigation menus or dashboards. */
  title: string;
  /** Primary functional area for grouping. */
  group: 'System & Executive' | 'Sales & Supply Chain' | 'Repair & Service' | 'Digital Content';
}

/**
 * @const ROLE_DEFINITIONS
 * The consolidated list of all roles with their defined paths and titles.
 */
export const ROLE_DEFINITIONS: RoleDefinition[] = [
  // --- 1. System & Executive Roles ---
  {
    role: "System Administrator",
    defaultPath: "/admin/settings",
    title: "System Configuration",
    group: 'System & Executive'
  },
  {
    role: "Executive Manager",
    defaultPath: "/dashboard/executive",
    title: "Executive Dashboard",
    group: 'System & Executive'
  },
  {
    role: "Financial Controller",
    defaultPath: "/finance/accounts-receivable",
    title: "Financial Audits",
    group: 'System & Executive'
  },
  {
    role: "Reporting Analyst",
    defaultPath: "/reports/data-export",
    title: "BI Data Tools",
    group: 'System & Executive'
  },

  // --- 2. Sales & Supply Chain Roles ---
  {
    role: "Sales Representative",
    defaultPath: "/sales/orders/new",
    title: "Sales Entry",
    group: 'Sales & Supply Chain'
  },
  {
    role: "Purchasing Agent",
    defaultPath: "/inventory/purchase-orders/new",
    title: "Purchase Orders",
    group: 'Sales & Supply Chain'
  },
  {
    role: "Warehouse/Logistics Manager",
    defaultPath: "/inventory/stock-view",
    title: "Warehouse Operations",
    group: 'Sales & Supply Chain'
  },

  // --- 3. Repair & Service Roles ---
  {
    role: "Front Desk / Service Agent",
    defaultPath: "/service/tickets/new",
    title: "Service Intake",
    group: 'Repair & Service'
  },
  {
    role: "Repair Technician",
    defaultPath: "/service/tickets/my-queue",
    title: "My Work Queue",
    group: 'Repair & Service'
  },
  {
    role: "Service Manager",
    defaultPath: "/service/tickets/all",
    title: "Service Management",
    group: 'Repair & Service'
  },

  // --- 4. Digital Content Roles ---
  {
    role: "Content Creator / Author",
    defaultPath: "/content/video/upload",
    title: "Content Studio",
    group: 'Digital Content'
  },
  {
    role: "Content Editor / Reviewer",
    defaultPath: "/content/video/review-queue",
    title: "Content Review",
    group: 'Digital Content'
  },
  {
    role: "Customer (Video Buyer)",
    defaultPath: "/my/video-library",
    title: "My Video Library",
    group: 'Digital Content'
  },
];
=======
// roles.ts

/**
 * @interface RoleDefinition
 * Defines the structure for each role in the unified system (SSEAMS + Juma + Video).
 * This structure is useful for routing, navigation display, and initial authorization checks.
 */
export interface RoleDefinition {
  /** The unique identifier for the role, matching the security policy. */
  role: string;
  /** The main dashboard or most frequently visited URL path for this role. */
  defaultPath: string;
  /** A human-readable title, often used in navigation menus or dashboards. */
  title: string;
  /** Primary functional area for grouping. */
  group: 'System & Executive' | 'Sales & Supply Chain' | 'Repair & Service' | 'Digital Content';
}

/**
 * @const ROLE_DEFINITIONS
 * The consolidated list of all roles with their defined paths and titles.
 */
export const ROLE_DEFINITIONS: RoleDefinition[] = [
  // --- 1. System & Executive Roles ---
  {
    role: "System Administrator",
    defaultPath: "/admin/settings",
    title: "System Configuration",
    group: 'System & Executive'
  },
  {
    role: "Executive Manager",
    defaultPath: "/dashboard/executive",
    title: "Executive Dashboard",
    group: 'System & Executive'
  },
  {
    role: "Financial Controller",
    defaultPath: "/finance/accounts-receivable",
    title: "Financial Audits",
    group: 'System & Executive'
  },
  {
    role: "Reporting Analyst",
    defaultPath: "/reports/data-export",
    title: "BI Data Tools",
    group: 'System & Executive'
  },

  // --- 2. Sales & Supply Chain Roles ---
  {
    role: "Sales Representative",
    defaultPath: "/sales/orders/new",
    title: "Sales Entry",
    group: 'Sales & Supply Chain'
  },
  {
    role: "Purchasing Agent",
    defaultPath: "/inventory/purchase-orders/new",
    title: "Purchase Orders",
    group: 'Sales & Supply Chain'
  },
  {
    role: "Warehouse/Logistics Manager",
    defaultPath: "/inventory/stock-view",
    title: "Warehouse Operations",
    group: 'Sales & Supply Chain'
  },

  // --- 3. Repair & Service Roles ---
  {
    role: "Front Desk / Service Agent",
    defaultPath: "/service/tickets/new",
    title: "Service Intake",
    group: 'Repair & Service'
  },
  {
    role: "Repair Technician",
    defaultPath: "/service/tickets/my-queue",
    title: "My Work Queue",
    group: 'Repair & Service'
  },
  {
    role: "Service Manager",
    defaultPath: "/service/tickets/all",
    title: "Service Management",
    group: 'Repair & Service'
  },

  // --- 4. Digital Content Roles ---
  {
    role: "Content Creator / Author",
    defaultPath: "/content/video/upload",
    title: "Content Studio",
    group: 'Digital Content'
  },
  {
    role: "Content Editor / Reviewer",
    defaultPath: "/content/video/review-queue",
    title: "Content Review",
    group: 'Digital Content'
  },
  {
    role: "Customer (Video Buyer)",
    defaultPath: "/my/video-library",
    title: "My Video Library",
    group: 'Digital Content'
  },
];
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
