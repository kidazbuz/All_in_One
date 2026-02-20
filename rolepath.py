import base64
import json
from typing import Dict, List, Any

# If using Django Groups directly, the keys must match the Group names.
GROUP_MENU_PATHS = {
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
}

# --- JWT/Base64 Payload Decoding Utility ---

def base64_url_decode(data: str) -> Dict[str, Any]:
    """
    Decodes a base64url string (used in JWTs/custom payloads) into a Python dictionary.
    Handles padding required for standard base64 decoding.
    """
    # Base64URL replaces '+' with '-' and '/' with '_' and removes padding ('=')
    # Restore padding
    padding = '=' * (4 - (len(data) % 4))
    encoded_data = data.replace('-', '+').replace('_', '/') + padding

    # Base64 decode
    decoded_bytes = base64.b64decode(encoded_data.encode('utf-8'))

    # Load JSON
    return json.loads(decoded_bytes.decode('utf-8'))

# Provided User Data Payload from your example (Base64URL encoded JSON)
ENCODED_USER_DATA = "eyJ1c2VyIjogeyJwaG9uZV9udW1iZXIiOiAiKzI1NTc1ODg5OTAyMyIsICJmaXJzdF9uYW1lIjogImFkYW11IiwgImxhc3RfbmFtZSI6ICJsYW1lY2siLCAiZW1haWwiOiAiYWRhbWxhbWVjazIwMTlAZ21haWwuY29tIiwgImlzX3ZlcmlmaWVkIjogdHJ1ZSwgImlzX3N0YWZmIjogZmFsc2V9fQ=="

def get_user_menu_paths(encoded_data: str) -> List[str]:
    """
    Decodes user data and attempts to retrieve the menu paths based on the user's role.
    """
    try:
        decoded_payload = base64_url_decode(encoded_data)
        user_info = decoded_payload.get('user', {})

        # --- CRITICAL POINT ---
        # The user's role MUST be added to this payload by the server.
        # Once added (e.g., key 'group_name' containing 'Sales Representative'),
        # this logic will work:
        user_role = user_info.get('group_name', 'Default Group')

        if user_role in GROUP_MENU_PATHS:
            print(f"Role '{user_role}' found. Returning paths.")
            return GROUP_MENU_PATHS[user_role]
        else:
            print(f"Role '{user_role}' not found in paths. Returning default paths.")
            return GROUP_MENU_PATHS['Default Group']

    except Exception as e:
        print(f"Error processing user data: {e}")
        return GROUP_MENU_PATHS['Default Group']

# Example Usage (for testing the decoding function)
# print("\n--- Testing Decoding on Provided Data ---")
# DECODED_USER_DATA = base64_url_decode(ENCODED_USER_DATA)
# print(json.dumps(DECODED_USER_DATA, indent=4))

# print("\n--- Testing Path Retrieval (Will default since 'group_name' is missing) ---")
# print(f"Paths: {get_user_menu_paths(ENCODED_USER_DATA)}")

# Expected Output after server customization (assuming 'group_name' is added):
# get_user_menu_paths("...encoded_with_role...")
