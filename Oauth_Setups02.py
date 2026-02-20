<<<<<<< HEAD
# minimal_oauth_project.py

import os
import sys
from django.conf import settings
from django.core.management import execute_from_command_line
from django.urls import path, include
from django.contrib import admin
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import serializers, viewsets, permissions
from rest_framework.response import Response
import oauth2_provider.urls
from oauth2_provider.contrib.rest_framework import TokenHasScope

# --- 1. MINIMAL DJANGO SETTINGS (The Core Configuration) ---

# We use the standard runserver command, so we set up the environment
if not settings.configured:
    settings.configure(
        # General Settings
        DEBUG=True,
        SECRET_KEY='a-secret-key-for-minimal-project',
        ROOT_URLCONF=__name__, # The URLs are defined within this same file

        # Database (SQLite for simplicity)
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': 'db.sqlite3',
            }
        },

        # Installed Apps
        INSTALLED_APPS=[
            'django.contrib.admin',
            'django.contrib.auth',
            'django.contrib.contenttypes',
            'django.contrib.sessions',
            'django.contrib.messages',
            'rest_framework',
            'oauth2_provider', # The essential component
        ],

        # 2. DRF Configuration
        REST_FRAMEWORK={
            'DEFAULT_AUTHENTICATION_CLASSES': (
                # Tells DRF to use the OAuth2 token checker
                'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
                'rest_framework.authentication.SessionAuthentication', # For browsable API
            ),
            'DEFAULT_PERMISSION_CLASSES': (
                'rest_framework.permissions.IsAuthenticated',
            )
        },

        # 3. OAUTH2 Toolkit Configuration
        OAUTH2_PROVIDER={
            # Define the scopes (permissions) clients can request
            'SCOPES': {
                'read': 'Read access to user data',
                'write': 'Write/modify access to user data',
            },
            'ACCESS_TOKEN_EXPIRE_SECONDS': 3600,
        },

        # Required by DOT's authorization process
        LOGIN_URL = '/admin/login/',
        TEMPLATES=[{
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.debug',
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                ],
            },
        }]
    )

# --- 4. DRF VIEW (The Protected Resource Logic) ---

class ExampleSerializer(serializers.Serializer):
    """Simple serializer for our response."""
    status = serializers.CharField()
    username = serializers.CharField()

class ProtectedResourceViewSet(viewsets.ViewSet):
    """
    A DRF ViewSet protected by OAuth2.
    """
    # The default permission checks for a valid, non-expired token.
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """
        GET /api/data/
        Requires 'read' scope.
        """
        # --- Check for specific scope ---
        # The user's token must have been granted the 'read' scope.
        if not TokenHasScope(scopes=['read']).has_permission(request, self):
             return Response({"detail": "Access denied. Token requires 'read' scope."}, status=403)
        # ---------------------------------

        data = {
            "status": "Success",
            "username": request.user.username,
            "message": f"Hello, {request.user.username}! This data is protected by OAuth2. Your token scope is '{request.auth.scope}'."
        }
        return Response(data)

    def create(self, request):
        """
        POST /api/data/
        Requires 'write' scope.
        """
        # --- Check for specific scope ---
        if not TokenHasScope(scopes=['write']).has_permission(request, self):
             return Response({"detail": "Access denied. Token requires 'write' scope."}, status=403)
        # ---------------------------------

        return Response({
            "message": f"Write operation successful for {request.user.username}.",
            "data_received": request.data
        }, status=201)

# Register the protected view
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'data', ProtectedResourceViewSet, basename='protected-data')


# --- 5. URL Configuration (The Project's routing) ---

def index_view(request):
    """A simple index page explaining how to proceed."""
    return render(request, 'index.html', {
        'title': 'Minimal OAuth2 DRF Project',
        'endpoints': [
            {'url': '/admin/', 'description': 'Django Admin (Create Users and OAuth Applications)'},
            {'url': '/o/token/', 'description': 'OAuth2 Token Endpoint (Get Access Tokens)'},
            {'url': '/api/data/', 'description': 'Protected API Endpoint (Requires Token with Scope: "read")'},
        ]
    })

urlpatterns = [
    path('', index_view, name='index'),
    path('admin/', admin.site.urls),
    # OAuth2 Toolkit Endpoints (e.g., /o/token/)
    path('o/', include(oauth2_provider.urls, namespace='oauth2_provider')),
    # Protected DRF API Endpoints
    path('api/', include(router.urls)),
]

# Create a dummy template for the index view
INDEX_TEMPLATE = """
<!DOCTYPE html>
<html>
<head><title>{{ title }}</title></head>
<body>
    <h1>{{ title }}</h1>
    <p>This is a single-file, minimal Django project demonstrating OAuth2 with DRF using django-oauth-toolkit.</p>
    <h2>Setup Steps:</h2>
    <ol>
        <li>Run the script with <code>python minimal_oauth_project.py makemigrations oauth2_provider</code></li>
        <li>Run the script with <code>python minimal_oauth_project.py migrate</code></li>
        <li>Run the script with <code>python minimal_oauth_project.py createsuperuser</code></li>
        <li>Run the server: <code>python minimal_oauth_project.py runserver</code></li>
    </ol>

    <h2>Testing the Flow:</h2>
    <ol>
        <li>Go to <a href="/admin/">/admin/</a> and login as the superuser.</li>
        <li>Under "Oauth2 Provider", click "Applications" and create a new one:
            <ul>
                <li>**Client type:** Confidential</li>
                <li>**Authorization grant type:** Resource owner password-based</li>
                <li>**Name:** Test Client</li>
            </ul>
        </li>
        <li>Note the **Client ID** and **Client Secret**.</li>
        <li>Use cURL to get a token (Replace USER/PASS/CLIENT_ID/CLIENT_SECRET):
        <pre>
curl -X POST http://127.0.0.1:8000/o/token/ -d "grant_type=password&username=USER&password=PASS&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&scope=read write"
        </pre>
        </li>
        <li>Use the returned ACCESS_TOKEN to access the protected resource:
        <pre>
curl -X GET http://127.0.0.1:8000/api/data/ -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
        </pre>
        </li>
    </ol>
</body>
</html>
"""
from django.template.loader import get_template
from django.template import Context, Template
# Monkey-patching the render function to use the in-memory template
def custom_render(request, template_name, context=None):
    if template_name == 'index.html':
        template = Template(INDEX_TEMPLATE)
        return HttpResponse(template.render(Context(context)))
    return HttpResponse("Template not found.")
# Replace the original render function
globals()['render'] = custom_render


# --- 6. COMMAND LINE EXECUTION ---

if __name__ == '__main__':
    # Default to 'runserver' if no command is given
    if len(sys.argv) == 1:
        sys.argv.append('runserver')

    # Check if the command is 'makemigrations' or 'migrate'
    # and add a default app label since we have no project structure
    if sys.argv[1] in ['makemigrations', 'migrate'] and len(sys.argv) == 2:
        # We only need to migrate the auth, admin, and oauth2_provider apps
        if sys.argv[1] == 'makemigrations':
             sys.argv.extend(['auth', 'oauth2_provider'])
        else: # migrate
             sys.argv.extend(['--run-syncdb']) # Fallback for minimal setup

    print(f"--- Running Django Command: {' '.join(sys.argv[1:])} ---")

    try:
        execute_from_command_line(sys.argv)
    except Exception as e:
        if "No such file or directory" in str(e) and sys.argv[1] == 'runserver':
            print("\n🚨 ERROR: Did you forget to run migrations?")
            print("1. Create migrations: python minimal_oauth_project.py makemigrations auth oauth2_provider")
            print("2. Apply migrations: python minimal_oauth_project.py migrate")
            print("3. Create user: python minimal_oauth_project.py createsuperuser")
            print("4. Run server: python minimal_oauth_project.py runserver")
        else:
             raise
=======
# minimal_oauth_project.py

import os
import sys
from django.conf import settings
from django.core.management import execute_from_command_line
from django.urls import path, include
from django.contrib import admin
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import serializers, viewsets, permissions
from rest_framework.response import Response
import oauth2_provider.urls
from oauth2_provider.contrib.rest_framework import TokenHasScope

# --- 1. MINIMAL DJANGO SETTINGS (The Core Configuration) ---

# We use the standard runserver command, so we set up the environment
if not settings.configured:
    settings.configure(
        # General Settings
        DEBUG=True,
        SECRET_KEY='a-secret-key-for-minimal-project',
        ROOT_URLCONF=__name__, # The URLs are defined within this same file

        # Database (SQLite for simplicity)
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': 'db.sqlite3',
            }
        },

        # Installed Apps
        INSTALLED_APPS=[
            'django.contrib.admin',
            'django.contrib.auth',
            'django.contrib.contenttypes',
            'django.contrib.sessions',
            'django.contrib.messages',
            'rest_framework',
            'oauth2_provider', # The essential component
        ],

        # 2. DRF Configuration
        REST_FRAMEWORK={
            'DEFAULT_AUTHENTICATION_CLASSES': (
                # Tells DRF to use the OAuth2 token checker
                'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
                'rest_framework.authentication.SessionAuthentication', # For browsable API
            ),
            'DEFAULT_PERMISSION_CLASSES': (
                'rest_framework.permissions.IsAuthenticated',
            )
        },

        # 3. OAUTH2 Toolkit Configuration
        OAUTH2_PROVIDER={
            # Define the scopes (permissions) clients can request
            'SCOPES': {
                'read': 'Read access to user data',
                'write': 'Write/modify access to user data',
            },
            'ACCESS_TOKEN_EXPIRE_SECONDS': 3600,
        },

        # Required by DOT's authorization process
        LOGIN_URL = '/admin/login/',
        TEMPLATES=[{
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.debug',
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                ],
            },
        }]
    )

# --- 4. DRF VIEW (The Protected Resource Logic) ---

class ExampleSerializer(serializers.Serializer):
    """Simple serializer for our response."""
    status = serializers.CharField()
    username = serializers.CharField()

class ProtectedResourceViewSet(viewsets.ViewSet):
    """
    A DRF ViewSet protected by OAuth2.
    """
    # The default permission checks for a valid, non-expired token.
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """
        GET /api/data/
        Requires 'read' scope.
        """
        # --- Check for specific scope ---
        # The user's token must have been granted the 'read' scope.
        if not TokenHasScope(scopes=['read']).has_permission(request, self):
             return Response({"detail": "Access denied. Token requires 'read' scope."}, status=403)
        # ---------------------------------

        data = {
            "status": "Success",
            "username": request.user.username,
            "message": f"Hello, {request.user.username}! This data is protected by OAuth2. Your token scope is '{request.auth.scope}'."
        }
        return Response(data)

    def create(self, request):
        """
        POST /api/data/
        Requires 'write' scope.
        """
        # --- Check for specific scope ---
        if not TokenHasScope(scopes=['write']).has_permission(request, self):
             return Response({"detail": "Access denied. Token requires 'write' scope."}, status=403)
        # ---------------------------------

        return Response({
            "message": f"Write operation successful for {request.user.username}.",
            "data_received": request.data
        }, status=201)

# Register the protected view
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'data', ProtectedResourceViewSet, basename='protected-data')


# --- 5. URL Configuration (The Project's routing) ---

def index_view(request):
    """A simple index page explaining how to proceed."""
    return render(request, 'index.html', {
        'title': 'Minimal OAuth2 DRF Project',
        'endpoints': [
            {'url': '/admin/', 'description': 'Django Admin (Create Users and OAuth Applications)'},
            {'url': '/o/token/', 'description': 'OAuth2 Token Endpoint (Get Access Tokens)'},
            {'url': '/api/data/', 'description': 'Protected API Endpoint (Requires Token with Scope: "read")'},
        ]
    })

urlpatterns = [
    path('', index_view, name='index'),
    path('admin/', admin.site.urls),
    # OAuth2 Toolkit Endpoints (e.g., /o/token/)
    path('o/', include(oauth2_provider.urls, namespace='oauth2_provider')),
    # Protected DRF API Endpoints
    path('api/', include(router.urls)),
]

# Create a dummy template for the index view
INDEX_TEMPLATE = """
<!DOCTYPE html>
<html>
<head><title>{{ title }}</title></head>
<body>
    <h1>{{ title }}</h1>
    <p>This is a single-file, minimal Django project demonstrating OAuth2 with DRF using django-oauth-toolkit.</p>
    <h2>Setup Steps:</h2>
    <ol>
        <li>Run the script with <code>python minimal_oauth_project.py makemigrations oauth2_provider</code></li>
        <li>Run the script with <code>python minimal_oauth_project.py migrate</code></li>
        <li>Run the script with <code>python minimal_oauth_project.py createsuperuser</code></li>
        <li>Run the server: <code>python minimal_oauth_project.py runserver</code></li>
    </ol>

    <h2>Testing the Flow:</h2>
    <ol>
        <li>Go to <a href="/admin/">/admin/</a> and login as the superuser.</li>
        <li>Under "Oauth2 Provider", click "Applications" and create a new one:
            <ul>
                <li>**Client type:** Confidential</li>
                <li>**Authorization grant type:** Resource owner password-based</li>
                <li>**Name:** Test Client</li>
            </ul>
        </li>
        <li>Note the **Client ID** and **Client Secret**.</li>
        <li>Use cURL to get a token (Replace USER/PASS/CLIENT_ID/CLIENT_SECRET):
        <pre>
curl -X POST http://127.0.0.1:8000/o/token/ -d "grant_type=password&username=USER&password=PASS&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&scope=read write"
        </pre>
        </li>
        <li>Use the returned ACCESS_TOKEN to access the protected resource:
        <pre>
curl -X GET http://127.0.0.1:8000/api/data/ -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
        </pre>
        </li>
    </ol>
</body>
</html>
"""
from django.template.loader import get_template
from django.template import Context, Template
# Monkey-patching the render function to use the in-memory template
def custom_render(request, template_name, context=None):
    if template_name == 'index.html':
        template = Template(INDEX_TEMPLATE)
        return HttpResponse(template.render(Context(context)))
    return HttpResponse("Template not found.")
# Replace the original render function
globals()['render'] = custom_render


# --- 6. COMMAND LINE EXECUTION ---

if __name__ == '__main__':
    # Default to 'runserver' if no command is given
    if len(sys.argv) == 1:
        sys.argv.append('runserver')

    # Check if the command is 'makemigrations' or 'migrate'
    # and add a default app label since we have no project structure
    if sys.argv[1] in ['makemigrations', 'migrate'] and len(sys.argv) == 2:
        # We only need to migrate the auth, admin, and oauth2_provider apps
        if sys.argv[1] == 'makemigrations':
             sys.argv.extend(['auth', 'oauth2_provider'])
        else: # migrate
             sys.argv.extend(['--run-syncdb']) # Fallback for minimal setup

    print(f"--- Running Django Command: {' '.join(sys.argv[1:])} ---")

    try:
        execute_from_command_line(sys.argv)
    except Exception as e:
        if "No such file or directory" in str(e) and sys.argv[1] == 'runserver':
            print("\n🚨 ERROR: Did you forget to run migrations?")
            print("1. Create migrations: python minimal_oauth_project.py makemigrations auth oauth2_provider")
            print("2. Apply migrations: python minimal_oauth_project.py migrate")
            print("3. Create user: python minimal_oauth_project.py createsuperuser")
            print("4. Run server: python minimal_oauth_project.py runserver")
        else:
             raise
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
