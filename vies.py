from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import mixins

# Import the models and serializers from the same application structure
from .models import Sale
from .serializers import SaleTransactionSerializer, SaleDetailSerializer

# NOTE: In a real Django project, you would define custom permissions
# like IsStaffUser or SaleManagerPermission. IsAdminUser is used here
# as a robust default to restrict access to internal staff only.


# --- 1. Transactional View (The POS Endpoint) ---
class SaleTransactionAPIView(APIView):
    """
    Endpoint for creating a new in-office sale transaction.
    Uses the write-only SaleTransactionSerializer to atomically create
    Sale, SaleItem records, StockMovement, and update Inventory.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, *args, **kwargs):
        # Pass the request context for access to request.user (sales_agent)
        serializer = SaleTransactionSerializer(data=request.data, context={'request': request})

        # Validation includes stock checks and total amount calculation
        serializer.is_valid(raise_exception=True)

        # The create method contains the atomic transaction logic
        sale_instance = serializer.save()

        # Return the created sale data using the read serializer for confirmation
        read_serializer = SaleDetailSerializer(sale_instance)

        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


# --- 2. Audit/Reporting ViewSet ---
class SaleAuditViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    GenericViewSet
):
    """
    Provides staff access to view the list of all sales and retrieve specific
    sale details for audit and reporting purposes. (Read-Only)
    """
    # Restrict access to staff users
    permission_classes = [IsAuthenticated, IsAdminUser]

    # Pre-fetch related data for efficient retrieval (reduces N+1 queries)
    queryset = Sale.objects.all().select_related(
        'customer',
        'sales_outlet',
        'sales_agent'
    ).prefetch_related(
        'items',
        'items__product_specification',
        'items__product_specification__inventory' # If you want deep nested data
    )

    # Use the Detail serializer for both list and retrieve actions
    serializer_class = SaleDetailSerializer

    def get_queryset(self):
        # Optional: Add filtering (e.g., filter by date, sales_outlet, or agent)
        qs = super().get_queryset()

        # Example filter: Only show sales from the last 30 days
        # date_limit = timezone.now() - timedelta(days=30)
        # qs = qs.filter(sale_date__gte=date_limit)

        return qs
