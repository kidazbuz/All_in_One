import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngFor, *ngIf

// --- 1. CORE RBAC CONFIGURATION (Simulated from backend) ---

/**
 * Defines which menu paths are accessible to which roles/groups.
 * NOTE: In a real Angular app, this configuration might be fetched from the backend.
 */
const GROUP_MENU_PATHS: { [key: string]: string[] } = {
  "Sales Representative": [
    "/sales/dashboard",
    "/sales/client-list",
    "/sales/create-order",
  ],
  "Reporting Analyst": [
    "/reporting/overview",
    "/reporting/user-activity",
    "/reporting/financial-summary",
  ],
  "Default Group": [
    "/profile",
    "/settings",
  ],
};

// --- 2. BASE64 DECODING UTILITY (Copied from TypeScript utility logic) ---

/**
 * Decodes a base64url string containing user data.
 * @param data The base64url encoded string.
 * @returns The decoded user object.
 */
function base64UrlDecode(data: string): any {
  try {
    // 1. Convert Base64URL to standard Base64
    let encodedData = data.replace(/-/g, '+').replace(/_/g, '/');

    // 2. Pad base64 string with '='
    while (encodedData.length % 4) {
      encodedData += '=';
    }

    // 3. Decode Base64 and parse JSON
    return JSON.parse(atob(encodedData));
  } catch (e) {
    console.error("Error decoding Base64 user data:", e);
    return {};
  }
}

// --- 3. ANGULAR RBAC APP COMPONENT ---

@Component({
  selector: 'app-root',
  // Required for single-file, standalone environment
  imports: [CommonModule],
  // We use the template to simulate the entire application structure including the navigation
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50 font-sans">

      <!-- Header / Navigation Bar -->
      <header class="bg-white shadow-md p-4 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <h1 class="text-2xl font-bold text-indigo-700">RBAC Demo</h1>

          <!-- Dynamic Navigation Menu -->
          <nav>
            <ul class="flex space-x-4">
              <!-- Dynamically rendered links based on authorizedPaths -->
              <li *ngFor="let path of authorizedPaths">
                <a
                  [href]="path"
                  class="text-gray-600 hover:text-indigo-700 px-3 py-2 rounded-lg transition-colors font-medium text-sm md:text-base"
                >
                  {{ formatPath(path) }}
                </a>
              </li>
            </ul>
          </nav>

        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-grow p-8">
        <div class="max-w-7xl mx-auto space-y-8">

          <h2 class="text-3xl font-extrabold text-gray-800">Welcome, {{ userName }}!</h2>

          <!-- Role Display Card -->
          <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow">
            <p class="text-indigo-700 font-semibold text-lg">
              Your Assigned Role (Group): <span class="font-extrabold">{{ userRole }}</span>
            </p>
            <p class="text-sm text-indigo-600 mt-1">
              The navigation links above are filtered based on this role, demonstrating RBAC.
            </p>
          </div>

          <!-- User Data Display -->
          <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 class="text-xl font-semibold mb-3 text-gray-700">Decoded User Payload:</h3>
            <pre class="bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-sm">{{ userData | json }}</pre>
          </div>

        </div>
      </main>

      <!-- Footer Component Logic Displaying the Current Year (from previous step) -->
      <footer class="bg-gray-200 text-gray-600 p-4 text-center shadow mt-auto border-t border-gray-300">
        <p class="text-sm font-light tracking-wide">
          &copy; {{ currentYear }} All Rights Reserved. RBAC Demo App.
        </p>
      </footer>
    </div>
  `,
  // Using plain CSS for styling if needed, but Tailwind is preferred/assumed.
  styles: [],
})
export class App implements OnInit {

  // --- STATE PROPERTIES ---

  readonly currentYear: number = new Date().getFullYear();

  // Simulated incoming user payload (MUST contain 'group_name' key for RBAC to work)
  // This uses a "Sales Representative" role for the demo.
  // Original Base64: eyJ1c2VyIjogeyJwaG9uZV9udW1iZXIiOiAiKzI1NTc1ODg5OTAyMyIsICJmaXJzdF9uYW1lIjogImFkYW11IiwgImxhc3RfbmFtZSI6ICJsYW1lY2siLCAiZW1haWwiOiAiYWRhbWxhbWVjazIwMTlAZ21haWwuY29tIiwgImlzX3ZlcmlmaWVkIjogdHJ1ZSwgImlzX3N0YWZmIjogZmFsc2UsICJyb2xlIjogIlJlcG9ydGluZyBBbmFseXN0In19
  // Updated payload including group_name (to match our config):
  readonly simulatedEncodedUserData: string =
      "eyJ1c2VyIjogeyJwaG9uZV9udW1iZXIiOiAiKzI1NTc1ODg5OTAyMyIsICJmaXJzdF9uYW1lIjogImFkYW11IiwgImxhc3RfbmFtZSI6ICJsYW1lY2siLCAiZW1haWwiOiAiYWRhbWxhbWVjazIwMTlAZ21haWwuY29tIiwgImlzX3ZlcmlmaWVkIjogdHJ1ZSwgImlzX3N0YWZmIjogZmFsc2UsICJncm91cF9uYW1lIjogIlJlcG9ydGluZyBBbmFseXN0In19";

  userData: any = {};
  userRole: string = 'Loading Role...';
  userName: string = 'User';
  authorizedPaths: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.decodeAndSetRole();
  }

  /**
   * Decodes the payload and sets the user's role and authorized paths.
   */
  private decodeAndSetRole(): void {
    // 1. Decode the Base64 payload
    const decodedPayload = base64UrlDecode(this.simulatedEncodedUserData);
    this.userData = decodedPayload;

    const userInfo = this.userData?.user || {};

    // 2. Extract User Details
    this.userName = userInfo.first_name || 'Guest';

    // 3. Extract Role (Group Name)
    const role = userInfo.group_name || 'Default Group';
    this.userRole = role;

    // 4. Map Role to Authorized Paths (The RBAC step!)
    this.authorizedPaths = GROUP_MENU_PATHS[role] || GROUP_MENU_PATHS['Default Group'];

    console.log(`User ${this.userName} loaded with role: ${this.userRole}.`);
  }

  /**
   * Helper function to format the URL path into a readable menu item.
   * e.g., /sales/client-list -> Client List
   */
  formatPath(path: string): string {
    const parts = path.split('/').filter(p => p.length > 0);
    if (parts.length === 0) return 'Home';

    // Take the last part, replace hyphens with spaces, and capitalize words
    const lastPart = parts[parts.length - 1];
    return lastPart
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
