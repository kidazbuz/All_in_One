#
# Unified Role-Based Access Control (RBAC) List
# System covers Sales/Supply (SSEAMS), Repair/Service (Juma), and Digital Content (Video)
#

# --- 1. System & Executive Roles (Oversight & Administration) ---
SYSTEM_AND_EXECUTIVE_ROLES = [
    {
        "Role Name": "System Administrator",
        "Primary Responsibility": "Ultimate control over the platform, user accounts, security, and configuration.",
        "Critical Permission Focus": "User/Role Management, Global Settings, System Audits, Security Logs."
    },
    {
        "Role Name": "Executive Manager",
        "Primary Responsibility": "High-level financial reporting, strategic planning, and final approvals (read-only in operational modules).",
        "Critical Permission Focus": "View All Financial Reports, Sales Analytics, Service Performance Metrics, Approve Large Discounts/Write-offs."
    },
    {
        "Role Name": "Financial Controller",
        "Primary Responsibility": "Auditing, reconciliation, payment processing, and core financial data access.",
        "Critical Permission Focus": "View and Process Payments/Refunds, Access P&L/Payroll data, Audit Logs. (Crucial for Separation of Duties)"
    },
    {
        "Role Name": "Reporting Analyst",
        "Primary Responsibility": "Extracting data for Business Intelligence (BI) and reporting; strictly read-only access to all data sources.",
        "Critical Permission Focus": "Export Sales/Service/Inventory/Content Data for Analysis."
    },
]

# --- 2. Sales & Supply Chain Roles (Physical Goods) ---
SALES_AND_SUPPLY_ROLES = [
    {
        "Role Name": "Sales Representative",
        "Primary Responsibility": "Customer interaction, processing new sales orders, and quoting.",
        "Critical Permission Focus": "Create Sales Orders, View Customer Details, Update Order Status (Pre-fulfillment)."
    },
    {
        "Role Name": "Purchasing Agent",
        "Primary Responsibility": "Sourcing new appliances and parts, managing supplier contracts, and placing Purchase Orders (POs).",
        "Critical Permission Focus": "Create POs, Manage Supplier Details, Approve Incoming Invoices (AP)."
    },
    {
        "Role Name": "Warehouse/Logistics Manager",
        "Primary Responsibility": "Overseeing inventory receipt, storage, fulfillment of sales, and general stock adjustments.",
        "Critical Permission Focus": "Adjust Stock Quantity, Receive Inventory Shipments, Generate Shipping Labels, Fulfill Sales Orders."
    },
]

# --- 3. Repair & Service Roles (Physical Service) ---
REPAIR_AND_SERVICE_ROLES = [
    {
        "Role Name": "Front Desk / Service Agent",
        "Primary Responsibility": "Customer intake, logging new repair tickets, quoting repair prices, and scheduling.",
        "Critical Permission Focus": "Create Service Tickets, Schedule Technician Appointments, Process Repair Payment, Generate Repair Quote."
    },
    {
        "Role Name": "Repair Technician",
        "Primary Responsibility": "Diagnosing, performing the repair, and consuming parts from stock.",
        "Critical Permission Focus": "View Assigned Tickets Only, Update Repair Progress, Add Consumed Parts to Ticket."
    },
    {
        "Role Name": "Service Manager",
        "Primary Responsibility": "Technical oversight, assigning jobs, resolving escalations, and approving non-standard repairs.",
        "Critical Permission Focus": "View All Service Tickets, Assign Technician, Override Repair Quote Price."
    },
]

# --- 4. Digital Content Roles (Video Tutorials) ---
DIGITAL_CONTENT_ROLES = [
    {
        "Role Name": "Content Creator / Author",
        "Primary Responsibility": "Developing the tutorial videos and submitting them for approval.",
        "Critical Permission Focus": "Upload/Edit Video Drafts, Edit Video Metadata/Tags, Submit for Review (Cannot publish)."
    },
    {
        "Role Name": "Content Editor / Reviewer",
        "Primary Responsibility": "Quality control, technical review, approving final pricing, and publishing content.",
        "Critical Permission Focus": "View All Drafts, Approve/Reject Content, Set Final Video Price, Publish Live."
    },
    {
        "Role Name": "Customer (Video Buyer)",
        "Primary Responsibility": "The end-user who has purchased access to the digital asset.",
        "Critical Permission Focus": "Read-only Access to Purchased Video Library, View License Key, Rate/Comment on Video."
    },
]

# --- Consolidated List of All Roles ---
ALL_ROLES = (
    SYSTEM_AND_EXECUTIVE_ROLES +
    SALES_AND_SUPPLY_ROLES +
    REPAIR_AND_SERVICE_ROLES +
    DIGITAL_CONTENT_ROLES
)

def list_all_roles_details():
    """
    Prints all defined roles along with their primary responsibility and critical permission focus.
    """
    sections = [
        ("💻 1. System & Executive Roles", SYSTEM_AND_EXECUTIVE_ROLES),
        ("📦 2. Sales & Supply Chain Roles", SALES_AND_SUPPLY_ROLES),
        ("🔧 3. Repair & Service Roles", REPAIR_AND_SERVICE_ROLES),
        ("🎥 4. Digital Content Roles", DIGITAL_CONTENT_ROLES),
    ]

    for title, roles_list in sections:
        print(f"\n--- {title} ---")
        for role in roles_list:
            print(f"\n  **Role:** {role['Role Name']}")
            print(f"    - Primary Responsibility: {role['Primary Responsibility']}")
            print(f"    - Critical Permission Focus: {role['Critical Permission Focus']}")

    print("\n--- Total Roles Defined: ---")
    print(f"Total: {len(ALL_ROLES)} roles")

if __name__ == "__main__":
    list_all_roles_details()
