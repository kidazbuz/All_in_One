<<<<<<< HEAD
#
# Role-Based Menu Structure Definition
#
# This dictionary maps each user role to a list of available menu paths (routes)
# and their corresponding titles. The first entry in each list is considered
# the default landing path for that role.
#

ROLE_MENU_PATHS = {
    # ------------------------------------
    # 1. SYSTEM & EXECUTIVE ROLES
    # ------------------------------------
    "System Administrator": [
        {"path": "/admin/settings", "title": "System Configuration"},
        {"path": "/admin/users", "title": "User Management"},
        {"path": "/admin/audit", "title": "Security & Audit Logs"},
    ],
    "Executive Manager": [
        {"path": "/dashboard/executive", "title": "Executive Overview"},
        {"path": "/reports/metrics/performance", "title": "KPMs & Performance"},
        {"path": "/reports/pnl", "title": "Financial Summary"},
    ],
    "Financial Controller": [
        {"path": "/finance/accounts-receivable", "title": "A/R & A/P Management"},
        {"path": "/finance/payments/audit", "title": "Payment Reconciliation"},
        {"path": "/reports/financial", "title": "General Ledger Access"},
    ],
    "Reporting Analyst": [
        {"path": "/reports/data-export", "title": "Data Export Tool"},
        {"path": "/reports/analytics/builder", "title": "Report Builder"},
        {"path": "/dashboard/reports", "title": "Saved Reports View"},
    ],

    # ------------------------------------
    # 2. SALES & SUPPLY CHAIN ROLES (SSEAMS E-COMMERCE & WAREHOUSE)
    # ------------------------------------
    "Sales Representative": [
        {"path": "/sales/orders/new", "title": "New Sales Order"},
        {"path": "/sales/orders/list", "title": "Open Orders"},
        {"path": "/sales/customers/reviews", "title": "Product/Review Moderation"}, # Added e-commerce feature
    ],
    "Purchasing Agent": [
        {"path": "/inventory/purchase-orders/new", "title": "Create Purchase Order"},
        {"path": "/suppliers", "title": "Supplier Management"},
        {"path": "/inventory/po/pending", "title": "Pending POs"},
    ],
    "Warehouse/Logistics Manager": [
        {"path": "/inventory/shipments/queue", "title": "Shipping Queue"},
        {"path": "/inventory/stock-view", "title": "Stock Levels"},
        {"path": "/inventory/receipts/new", "title": "Receive Goods"},
    ],

    # ------------------------------------
    # 3. REPAIR & SERVICE ROLES
    # ------------------------------------
    "Front Desk / Service Agent": [
        {"path": "/service/tickets/new", "title": "Log New Service Ticket"},
        {"path": "/service/tickets/search", "title": "Search Tickets"},
        {"path": "/service/scheduling", "title": "Appointment Scheduling"},
    ],
    "Repair Technician": [
        {"path": "/service/tickets/my-queue", "title": "My Job Queue"},
        {"path": "/service/ticket/update", "title": "Update Job Progress"},
        {"path": "/service/inventory/parts", "title": "Parts Request"},
    ],
    "Service Manager": [
        {"path": "/service/tickets/all", "title": "All Service Tickets"},
        {"path": "/service/technicians/performance", "title": "Tech Performance"},
        {"path": "/service/tickets/approvals", "title": "Quote Approvals"},
    ],

    # ------------------------------------
    # 4. DIGITAL CONTENT & CUSTOMER ROLES
    # ------------------------------------
    "Content Creator / Author": [
        {"path": "/content/video/upload", "title": "Upload New Video"},
        {"path": "/content/video/drafts", "title": "My Drafts"},
        {"path": "/content/dashboard", "title": "Creator Dashboard"},
    ],
    "Content Editor / Reviewer": [
        {"path": "/content/video/review-queue", "title": "Content Review Queue"},
        {"path": "/content/review/moderation", "title": "Content Review Moderation"}, # Added review moderation
        {"path": "/content/video/published", "title": "Manage Published"},
    ],
    "Customer": [ # Consolidated customer-facing paths (E-commerce + Video Buyer)
        {"path": "/my/orders", "title": "My Orders & Tracking"}, # New E-commerce path
        {"path": "/my/video-library", "title": "My Purchased Videos"},
        {"path": "/my/wishlist", "title": "My Wishlist"}, # New E-commerce path
        {"path": "/my/reviews", "title": "My Product Reviews"}, # New E-commerce path
        {"path": "/content/video/search", "title": "Browse Content"},
        {"path": "/my/profile/licenses", "title": "Manage Licenses"},
    ],
}

def print_role_menu_paths():
    """
    Prints the role menu paths in a readable format, highlighting the default path.
    """
    print("--- Consolidated Role Menu Paths ---")
    for role, paths in ROLE_MENU_PATHS.items():
        print(f"\n[ ROLE: {role} ]")
        for i, item in enumerate(paths):
            prefix = "-> (DEFAULT)" if i == 0 else "   - (MINOR)"
            print(f"{prefix} Path: {item['path']} | Title: {item['title']}")

    print("\n--- Total Roles Defined: {} ---".format(len(ROLE_MENU_PATHS)))

if __name__ == "__main__":
    print_role_menu_paths()
=======
#
# Role-Based Menu Structure Definition
#
# This dictionary maps each user role to a list of available menu paths (routes)
# and their corresponding titles. The first entry in each list is considered
# the default landing path for that role.
#

ROLE_MENU_PATHS = {
    # ------------------------------------
    # 1. SYSTEM & EXECUTIVE ROLES
    # ------------------------------------
    "System Administrator": [
        {"path": "/admin/settings", "title": "System Configuration"},
        {"path": "/admin/users", "title": "User Management"},
        {"path": "/admin/audit", "title": "Security & Audit Logs"},
    ],
    "Executive Manager": [
        {"path": "/dashboard/executive", "title": "Executive Overview"},
        {"path": "/reports/metrics/performance", "title": "KPMs & Performance"},
        {"path": "/reports/pnl", "title": "Financial Summary"},
    ],
    "Financial Controller": [
        {"path": "/finance/accounts-receivable", "title": "A/R & A/P Management"},
        {"path": "/finance/payments/audit", "title": "Payment Reconciliation"},
        {"path": "/reports/financial", "title": "General Ledger Access"},
    ],
    "Reporting Analyst": [
        {"path": "/reports/data-export", "title": "Data Export Tool"},
        {"path": "/reports/analytics/builder", "title": "Report Builder"},
        {"path": "/dashboard/reports", "title": "Saved Reports View"},
    ],

    # ------------------------------------
    # 2. SALES & SUPPLY CHAIN ROLES (SSEAMS E-COMMERCE & WAREHOUSE)
    # ------------------------------------
    "Sales Representative": [
        {"path": "/sales/orders/new", "title": "New Sales Order"},
        {"path": "/sales/orders/list", "title": "Open Orders"},
        {"path": "/sales/customers/reviews", "title": "Product/Review Moderation"}, # Added e-commerce feature
    ],
    "Purchasing Agent": [
        {"path": "/inventory/purchase-orders/new", "title": "Create Purchase Order"},
        {"path": "/suppliers", "title": "Supplier Management"},
        {"path": "/inventory/po/pending", "title": "Pending POs"},
    ],
    "Warehouse/Logistics Manager": [
        {"path": "/inventory/shipments/queue", "title": "Shipping Queue"},
        {"path": "/inventory/stock-view", "title": "Stock Levels"},
        {"path": "/inventory/receipts/new", "title": "Receive Goods"},
    ],

    # ------------------------------------
    # 3. REPAIR & SERVICE ROLES
    # ------------------------------------
    "Front Desk / Service Agent": [
        {"path": "/service/tickets/new", "title": "Log New Service Ticket"},
        {"path": "/service/tickets/search", "title": "Search Tickets"},
        {"path": "/service/scheduling", "title": "Appointment Scheduling"},
    ],
    "Repair Technician": [
        {"path": "/service/tickets/my-queue", "title": "My Job Queue"},
        {"path": "/service/ticket/update", "title": "Update Job Progress"},
        {"path": "/service/inventory/parts", "title": "Parts Request"},
    ],
    "Service Manager": [
        {"path": "/service/tickets/all", "title": "All Service Tickets"},
        {"path": "/service/technicians/performance", "title": "Tech Performance"},
        {"path": "/service/tickets/approvals", "title": "Quote Approvals"},
    ],

    # ------------------------------------
    # 4. DIGITAL CONTENT & CUSTOMER ROLES
    # ------------------------------------
    "Content Creator / Author": [
        {"path": "/content/video/upload", "title": "Upload New Video"},
        {"path": "/content/video/drafts", "title": "My Drafts"},
        {"path": "/content/dashboard", "title": "Creator Dashboard"},
    ],
    "Content Editor / Reviewer": [
        {"path": "/content/video/review-queue", "title": "Content Review Queue"},
        {"path": "/content/review/moderation", "title": "Content Review Moderation"}, # Added review moderation
        {"path": "/content/video/published", "title": "Manage Published"},
    ],
    "Customer": [ # Consolidated customer-facing paths (E-commerce + Video Buyer)
        {"path": "/my/orders", "title": "My Orders & Tracking"}, # New E-commerce path
        {"path": "/my/video-library", "title": "My Purchased Videos"},
        {"path": "/my/wishlist", "title": "My Wishlist"}, # New E-commerce path
        {"path": "/my/reviews", "title": "My Product Reviews"}, # New E-commerce path
        {"path": "/content/video/search", "title": "Browse Content"},
        {"path": "/my/profile/licenses", "title": "Manage Licenses"},
    ],
}

def print_role_menu_paths():
    """
    Prints the role menu paths in a readable format, highlighting the default path.
    """
    print("--- Consolidated Role Menu Paths ---")
    for role, paths in ROLE_MENU_PATHS.items():
        print(f"\n[ ROLE: {role} ]")
        for i, item in enumerate(paths):
            prefix = "-> (DEFAULT)" if i == 0 else "   - (MINOR)"
            print(f"{prefix} Path: {item['path']} | Title: {item['title']}")

    print("\n--- Total Roles Defined: {} ---".format(len(ROLE_MENU_PATHS)))

if __name__ == "__main__":
    print_role_menu_paths()
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
