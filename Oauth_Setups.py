# settings.py

INSTALLED_APPS = [
    # ... other Django apps
    'rest_framework',
    'oauth2_provider',
]

# Run migrations to create the necessary OAuth2 tables
# python manage.py migrate

# settings.py

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # Use OAuth2Authentication for token-based access
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        # You may keep SessionAuthentication for the browsable API or internal access
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}

OAUTH2_PROVIDER = {
    # Define the scopes (permissions) that clients can request
    'SCOPES': {
        'read': 'Read access to protected resources',
        'write': 'Write access to protected resources',
        'groups': 'Access to user groups',
    },
    'ACCESS_TOKEN_EXPIRE_SECONDS': 36000, # Example: 10 hours expiration
}

# The LOGIN_URL is needed for the OAuth2 views
LOGIN_URL = '/admin/login/' # Or your custom login URL

# urls.py (your project's main urls.py)

from django.urls import path, include
from django.contrib import admin
import oauth2_provider.urls

urlpatterns = [
    path('admin/', admin.site.urls),
    # This path includes all the OAuth2 endpoints: /o/authorize, /o/token, etc.
    path('o/', include(oauth2_provider.urls, namespace='oauth2_provider')),
    # path('api/', include('your_app.urls')), # Your API endpoints
]

# your_app/views.py

from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope

# Example View
class UserProfileView(generics.RetrieveAPIView):
    # Standard DRF permission: User must be authenticated
    permission_classes = [permissions.IsAuthenticated, TokenHasReadWriteScope]

    # Or, for more granular control:
    # permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    # required_scopes = ['read'] # Only clients with 'read' scope can access this

    # ... your queryset and serializer
