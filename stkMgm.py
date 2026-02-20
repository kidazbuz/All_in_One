<<<<<<< HEAD
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.conf import settings


class WarehouseLocation(models.Model):
    """
    Stores physical locations (warehouses, stores, staging areas).
    """
    name = models.CharField(max_length=100, unique=True, verbose_name=_("Location Name"))
    code = models.CharField(max_length=20, unique=True, help_text=_("Short code (e.g., WA, SCL)"))
    address = models.TextField(blank=True, verbose_name=_("Full Address"))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Warehouse Location")
        verbose_name_plural = _("Warehouse Locations")
        ordering = ('name',)

    def __str__(self):
        return self.name


class ShelfLocation(models.Model):
    """
    Defines the specific physical coordinates (Aisle, Rack, Shelf)
    within a WarehouseLocation. This enables efficient retrieval (Easy Access).
    """
    warehouse = models.ForeignKey(
        WarehouseLocation,
        on_delete=models.CASCADE,
        related_name='shelf_coordinates',
        verbose_name=_("Parent Warehouse")
    )
    aisle = models.CharField(max_length=10, help_text=_("e.g., A01, Aisle 3"))
    rack = models.CharField(max_length=10, help_text=_("e.g., R5, Rack C"))
    shelf = models.CharField(max_length=10, help_text=_("e.g., S3, Shelf Level 4"))

    location_type = models.CharField(
        max_length=50,
        choices=[('PRIMARY', 'Primary Picking'), ('OVERFLOW', 'Overflow'), ('SECURE', 'Secure Cage')],
        default='PRIMARY'
    )

    class Meta:
        verbose_name = _("Shelf Coordinate")
        verbose_name_plural = _("Shelf Coordinates")
        ordering = ['warehouse__name', 'aisle', 'rack', 'shelf']
        unique_together = ('warehouse', 'aisle', 'rack', 'shelf')

    def __str__(self):
        return f"{self.warehouse.code}:{self.aisle}-{self.rack}-{self.shelf}"


class Batch(models.Model):
    """
    Tracks a specific shipment of stock received. This is the core unit
    for FIFO retrieval logic and accurate cost tracking.
    """
    product = models.ForeignKey(
        ProductSpecification,
        on_delete=models.CASCADE,
        related_name='batches',
        verbose_name=_("Product (SKU)")
    )
    receipt_date = models.DateTimeField(default=timezone.now)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Landed Unit Cost"))
    initial_quantity = models.PositiveIntegerField(verbose_name=_("Initial Quantity Received"))

    class Meta:
        verbose_name = _("Stock Batch")
        verbose_name_plural = _("Stock Batches")
        ordering = ['receipt_date']

    def __str__(self):
        return f"Batch {self.id} | {self.product_sku} | Rcvd: {self.receipt_date.strftime('%Y-%m-%d')}"


class Inventory(models.Model):
    """
    Tracks the quantity of a specific Batch (FIFO) at a specific ShelfLocation (Coordinates).
    """
    batch = models.ForeignKey(
        Batch,
        on_delete=models.CASCADE,
        related_name='inventory_records',
        verbose_name=_("Stock Batch")
    )
    location = models.ForeignKey(
        ShelfLocation,
        on_delete=models.PROTECT,
        related_name='stocked_items',
        verbose_name=_("Shelf Coordinates")
    )

    quantity_in_stock = models.PositiveIntegerField(default=0)
    safety_stock_level = models.IntegerField(default=5)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Inventory Record")
        verbose_name_plural = _("Inventory Records")
        unique_together = ('batch', 'location')

    def __str__(self):
        return f"{self.batch.product_sku} | {self.quantity_in_stock} units at {self.location}"

    @property
    def is_low_stock(self):
        return self.quantity_in_stock <= self.safety_stock_level

class StockMovement(models.Model):
    """
    Tracks every transaction that modifies the Inventory quantity, providing an auditable trail.
    """
    MOVEMENT_TYPES = [
        ('SALE', 'Sale (Decrement)'),
        ('RETURN', 'Return (Increment)'),
        ('RESTOCK', 'Restock (Increment)'),
        ('ADJUST', 'Manual Adjustment (Staff)'),
        ('TRANSFER', 'Transfer (Internal Move)'),
    ]
    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name='movement_history',
        verbose_name=_("Stock Batch Moved")
    )

    movement_type = models.CharField(max_length=10, choices=MOVEMENT_TYPES, verbose_name=_("Movement Type"))
    quantity_change = models.IntegerField(verbose_name=_("Quantity Change (+ or -)"))
    source_location = models.ForeignKey(
        ShelfLocation,
        on_delete=models.PROTECT,
        related_name='outbound_movements',
        null=True, blank=True,
        verbose_name=_("Source Shelf")
    )
    target_location = models.ForeignKey(
        ShelfLocation,
        on_delete=models.PROTECT,
        related_name='inbound_movements',
        null=True, blank=True,
        verbose_name=_("Target Shelf")
    )
    reference_id = models.CharField(max_length=50, blank=True, null=True, verbose_name=_("Reference ID"))
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Performed By"))
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = _("Stock Movement")
        verbose_name_plural = _("Stock Movements")
        ordering = ('-timestamp',)

    def __str__(self):
        source = str(self.source_location) if self.source_location else 'External'
        target = str(self.target_location) if self.target_location else 'External'
        return f"{self.movement_type} | {self.batch.product_sku} | Change: {self.quantity_change} | {source} -> {target}"
=======
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.conf import settings


class WarehouseLocation(models.Model):
    """
    Stores physical locations (warehouses, stores, staging areas).
    """
    name = models.CharField(max_length=100, unique=True, verbose_name=_("Location Name"))
    code = models.CharField(max_length=20, unique=True, help_text=_("Short code (e.g., WA, SCL)"))
    address = models.TextField(blank=True, verbose_name=_("Full Address"))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Warehouse Location")
        verbose_name_plural = _("Warehouse Locations")
        ordering = ('name',)

    def __str__(self):
        return self.name


class ShelfLocation(models.Model):
    """
    Defines the specific physical coordinates (Aisle, Rack, Shelf)
    within a WarehouseLocation. This enables efficient retrieval (Easy Access).
    """
    warehouse = models.ForeignKey(
        WarehouseLocation,
        on_delete=models.CASCADE,
        related_name='shelf_coordinates',
        verbose_name=_("Parent Warehouse")
    )
    aisle = models.CharField(max_length=10, help_text=_("e.g., A01, Aisle 3"))
    rack = models.CharField(max_length=10, help_text=_("e.g., R5, Rack C"))
    shelf = models.CharField(max_length=10, help_text=_("e.g., S3, Shelf Level 4"))

    location_type = models.CharField(
        max_length=50,
        choices=[('PRIMARY', 'Primary Picking'), ('OVERFLOW', 'Overflow'), ('SECURE', 'Secure Cage')],
        default='PRIMARY'
    )

    class Meta:
        verbose_name = _("Shelf Coordinate")
        verbose_name_plural = _("Shelf Coordinates")
        ordering = ['warehouse__name', 'aisle', 'rack', 'shelf']
        unique_together = ('warehouse', 'aisle', 'rack', 'shelf')

    def __str__(self):
        return f"{self.warehouse.code}:{self.aisle}-{self.rack}-{self.shelf}"


class Batch(models.Model):
    """
    Tracks a specific shipment of stock received. This is the core unit
    for FIFO retrieval logic and accurate cost tracking.
    """
    product = models.ForeignKey(
        ProductSpecification,
        on_delete=models.CASCADE,
        related_name='batches',
        verbose_name=_("Product (SKU)")
    )
    receipt_date = models.DateTimeField(default=timezone.now)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Landed Unit Cost"))
    initial_quantity = models.PositiveIntegerField(verbose_name=_("Initial Quantity Received"))

    class Meta:
        verbose_name = _("Stock Batch")
        verbose_name_plural = _("Stock Batches")
        ordering = ['receipt_date']

    def __str__(self):
        return f"Batch {self.id} | {self.product_sku} | Rcvd: {self.receipt_date.strftime('%Y-%m-%d')}"


class Inventory(models.Model):
    """
    Tracks the quantity of a specific Batch (FIFO) at a specific ShelfLocation (Coordinates).
    """
    batch = models.ForeignKey(
        Batch,
        on_delete=models.CASCADE,
        related_name='inventory_records',
        verbose_name=_("Stock Batch")
    )
    location = models.ForeignKey(
        ShelfLocation,
        on_delete=models.PROTECT,
        related_name='stocked_items',
        verbose_name=_("Shelf Coordinates")
    )

    quantity_in_stock = models.PositiveIntegerField(default=0)
    safety_stock_level = models.IntegerField(default=5)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Inventory Record")
        verbose_name_plural = _("Inventory Records")
        unique_together = ('batch', 'location')

    def __str__(self):
        return f"{self.batch.product_sku} | {self.quantity_in_stock} units at {self.location}"

    @property
    def is_low_stock(self):
        return self.quantity_in_stock <= self.safety_stock_level

class StockMovement(models.Model):
    """
    Tracks every transaction that modifies the Inventory quantity, providing an auditable trail.
    """
    MOVEMENT_TYPES = [
        ('SALE', 'Sale (Decrement)'),
        ('RETURN', 'Return (Increment)'),
        ('RESTOCK', 'Restock (Increment)'),
        ('ADJUST', 'Manual Adjustment (Staff)'),
        ('TRANSFER', 'Transfer (Internal Move)'),
    ]
    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name='movement_history',
        verbose_name=_("Stock Batch Moved")
    )

    movement_type = models.CharField(max_length=10, choices=MOVEMENT_TYPES, verbose_name=_("Movement Type"))
    quantity_change = models.IntegerField(verbose_name=_("Quantity Change (+ or -)"))
    source_location = models.ForeignKey(
        ShelfLocation,
        on_delete=models.PROTECT,
        related_name='outbound_movements',
        null=True, blank=True,
        verbose_name=_("Source Shelf")
    )
    target_location = models.ForeignKey(
        ShelfLocation,
        on_delete=models.PROTECT,
        related_name='inbound_movements',
        null=True, blank=True,
        verbose_name=_("Target Shelf")
    )
    reference_id = models.CharField(max_length=50, blank=True, null=True, verbose_name=_("Reference ID"))
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Performed By"))
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = _("Stock Movement")
        verbose_name_plural = _("Stock Movements")
        ordering = ('-timestamp',)

    def __str__(self):
        source = str(self.source_location) if self.source_location else 'External'
        target = str(self.target_location) if self.target_location else 'External'
        return f"{self.movement_type} | {self.batch.product_sku} | Change: {self.quantity_change} | {source} -> {target}"
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
