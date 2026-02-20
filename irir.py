from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SaleTransactionAPIView, SaleAuditViewSet

router = DefaultRouter()
router.register(r'sales', SaleAuditViewSet, basename='sale-audit')

urlpatterns = [
    # POST /api/v1/sales/record/ - Used for creating a new sale (POS)
    path('sales/record/', SaleTransactionAPIView.as_view(), name='sale-transaction-record'),

    # GET /api/v1/sales/ and GET /api/v1/sales/{id}/ - Used for audit/listing
    path('', include(router.urls)),
]
