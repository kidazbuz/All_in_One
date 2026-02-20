<<<<<<< HEAD
from django.db import models
from django.utils import timezone
from django.conf import settings

# NOTE: You must import your WarehouseLocation model here

class Sale(models.Model):
    sale_date = models.DateTimeField(default=timezone.now)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # 🌟 CRUCIAL STAFF/LOCATION CONTEXT
    sales_outlet = models.ForeignKey(
        'WarehouseLocation', # Assuming this is the model for your offices
        on_delete=models.SET_NULL,
        null=True,
        help_text="The office/location where the sale was recorded."
    )
    sales_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sales_recorded',
        help_text="The staff member who processed the sale."
    )
    status = models.CharField(
        max_length=20,
        default='COMPLETED',
        choices=[('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled'), ('REFUNDED', 'Refunded')]
    )

    def __str__(self):
        return f"Sale #{self.id} - {self.sale_date.date()}"


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, related_name='items', on_delete=models.CASCADE)

    # 🌟 CRUCIAL INVENTORY LINKAGE
    # Linking to ProductSpecification (or whatever model tracks inventory SKU)
    product_specification = models.ForeignKey('products.ProductSpecification', on_delete=models.CASCADE)

    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    unit_measure = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ['-sale']
        # Ensures a product is not listed twice on the same sale (usually enforced by logic, but a good constraint)
        unique_together = ('sale', 'product_specification')

    def __str__(self):
        return f"{self.product_specification} x {self.quantity}"




























from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
# Assuming your models are imported here

# --- Nested Serializer for Products in the Sale ---
class SaleItemSerializer(serializers.Serializer):
    """Handles line items within a single transaction."""
    product_sku = serializers.CharField(max_length=50) # Use SKU for fast lookup
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)


# --- Main Transaction Serializer ---
class SaleTransactionSerializer(serializers.Serializer):
    """Handles creation of SalesOrder, OrderItems, StockMovement, and Inventory update."""
    sales_outlet = serializers.PrimaryKeyRelatedField(
        queryset=WarehouseLocation.objects.all(), # Assuming your offices are WarehouseLocations
        required=True
    )
    # The list of products being sold
    items = SaleItemSerializer(many=True)

    # Optional fields like customer_info or payment_method can be added here

    def validate(self, data):
        # 1. Check for stock availability and calculate total
        self.stock_checks = {} # Stores {sku: inventory_instance} for use in save()
        total = 0

        for item_data in data['items']:
            sku = item_data['product_sku']
            quantity = item_data['quantity']
            unit_price = item_data['unit_price']

            try:
                # Optimized lookup: ProductSpec -> Inventory
                product_spec = ProductSpecification.objects.select_related('inventory').get(sku=sku)
                inventory_item = product_spec.inventory

                # Check 1: Availability
                if quantity > inventory_item.quantity_in_stock:
                    raise serializers.ValidationError(
                        f"Insufficient stock for SKU {sku}. Only {inventory_item.quantity_in_stock} available."
                    )

                self.stock_checks[sku] = {'product_spec': product_spec, 'inventory': inventory_item}
                total += quantity * unit_price

            except ProductSpecification.DoesNotExist:
                raise serializers.ValidationError(f"Product with SKU {sku} does not exist.")

        self.validated_data['total_amount'] = total
        return data

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get('request')
        items_data = validated_data.pop('items')

        # 1. Create the main Sales Order record
        order = SalesOrder.objects.create(
            sales_outlet=validated_data['sales_outlet'],
            sales_agent=request.user, # The staff member making the sale
            total_amount=validated_data['total_amount'],
            status='COMPLETED', # Instant sale
            timestamp=timezone.now()
        )

        # 2. Process each item (Create OrderItem and update Inventory/StockMovement)
        for item_data in items_data:
            sku = item_data['product_sku']
            quantity = item_data['quantity']
            unit_price = item_data['unit_price']

            # Retrieve cached instances from validation step
            cache = self.stock_checks[sku]
            product_spec = cache['product_spec']
            inventory_item = cache['inventory']

            # A. Create Order Item
            OrderItem.objects.create(
                order=order,
                product_specification=product_spec,
                quantity=quantity,
                unit_price_at_sale=unit_price
            )

            # B. Create Stock Movement (Audit Trail)
            StockMovement.objects.create(
                product=product_spec,
                movement_type='SALE',
                quantity_change=-quantity, # Sale is a negative movement
                unit_cost=inventory_item.unit_cost, # Cost of goods sold (optional field)
                reference_id=f"SALE-{order.pk}",
                performed_by=request.user,
            )

            # C. Update Inventory Quantity
            inventory_item.quantity_in_stock -= quantity
            inventory_item.save(update_fields=['quantity_in_stock', 'updated_at'])

        return order
=======
from django.db import models
from django.utils import timezone
from django.conf import settings

# NOTE: You must import your WarehouseLocation model here

class Sale(models.Model):
    sale_date = models.DateTimeField(default=timezone.now)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # 🌟 CRUCIAL STAFF/LOCATION CONTEXT
    sales_outlet = models.ForeignKey(
        'WarehouseLocation', # Assuming this is the model for your offices
        on_delete=models.SET_NULL,
        null=True,
        help_text="The office/location where the sale was recorded."
    )
    sales_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sales_recorded',
        help_text="The staff member who processed the sale."
    )
    status = models.CharField(
        max_length=20,
        default='COMPLETED',
        choices=[('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled'), ('REFUNDED', 'Refunded')]
    )

    def __str__(self):
        return f"Sale #{self.id} - {self.sale_date.date()}"


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, related_name='items', on_delete=models.CASCADE)

    # 🌟 CRUCIAL INVENTORY LINKAGE
    # Linking to ProductSpecification (or whatever model tracks inventory SKU)
    product_specification = models.ForeignKey('products.ProductSpecification', on_delete=models.CASCADE)

    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    unit_measure = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ['-sale']
        # Ensures a product is not listed twice on the same sale (usually enforced by logic, but a good constraint)
        unique_together = ('sale', 'product_specification')

    def __str__(self):
        return f"{self.product_specification} x {self.quantity}"




























from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
# Assuming your models are imported here

# --- Nested Serializer for Products in the Sale ---
class SaleItemSerializer(serializers.Serializer):
    """Handles line items within a single transaction."""
    product_sku = serializers.CharField(max_length=50) # Use SKU for fast lookup
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)


# --- Main Transaction Serializer ---
class SaleTransactionSerializer(serializers.Serializer):
    """Handles creation of SalesOrder, OrderItems, StockMovement, and Inventory update."""
    sales_outlet = serializers.PrimaryKeyRelatedField(
        queryset=WarehouseLocation.objects.all(), # Assuming your offices are WarehouseLocations
        required=True
    )
    # The list of products being sold
    items = SaleItemSerializer(many=True)

    # Optional fields like customer_info or payment_method can be added here

    def validate(self, data):
        # 1. Check for stock availability and calculate total
        self.stock_checks = {} # Stores {sku: inventory_instance} for use in save()
        total = 0

        for item_data in data['items']:
            sku = item_data['product_sku']
            quantity = item_data['quantity']
            unit_price = item_data['unit_price']

            try:
                # Optimized lookup: ProductSpec -> Inventory
                product_spec = ProductSpecification.objects.select_related('inventory').get(sku=sku)
                inventory_item = product_spec.inventory

                # Check 1: Availability
                if quantity > inventory_item.quantity_in_stock:
                    raise serializers.ValidationError(
                        f"Insufficient stock for SKU {sku}. Only {inventory_item.quantity_in_stock} available."
                    )

                self.stock_checks[sku] = {'product_spec': product_spec, 'inventory': inventory_item}
                total += quantity * unit_price

            except ProductSpecification.DoesNotExist:
                raise serializers.ValidationError(f"Product with SKU {sku} does not exist.")

        self.validated_data['total_amount'] = total
        return data

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get('request')
        items_data = validated_data.pop('items')

        # 1. Create the main Sales Order record
        order = SalesOrder.objects.create(
            sales_outlet=validated_data['sales_outlet'],
            sales_agent=request.user, # The staff member making the sale
            total_amount=validated_data['total_amount'],
            status='COMPLETED', # Instant sale
            timestamp=timezone.now()
        )

        # 2. Process each item (Create OrderItem and update Inventory/StockMovement)
        for item_data in items_data:
            sku = item_data['product_sku']
            quantity = item_data['quantity']
            unit_price = item_data['unit_price']

            # Retrieve cached instances from validation step
            cache = self.stock_checks[sku]
            product_spec = cache['product_spec']
            inventory_item = cache['inventory']

            # A. Create Order Item
            OrderItem.objects.create(
                order=order,
                product_specification=product_spec,
                quantity=quantity,
                unit_price_at_sale=unit_price
            )

            # B. Create Stock Movement (Audit Trail)
            StockMovement.objects.create(
                product=product_spec,
                movement_type='SALE',
                quantity_change=-quantity, # Sale is a negative movement
                unit_cost=inventory_item.unit_cost, # Cost of goods sold (optional field)
                reference_id=f"SALE-{order.pk}",
                performed_by=request.user,
            )

            # C. Update Inventory Quantity
            inventory_item.quantity_in_stock -= quantity
            inventory_item.save(update_fields=['quantity_in_stock', 'updated_at'])

        return order
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
