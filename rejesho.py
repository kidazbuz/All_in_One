<<<<<<< HEAD
from django.db import models
from django.utils import timezone
from django.conf import settings
from decimal import Decimal

class Sale(models.Model):
    sale_date = models.DateTimeField(default=timezone.now, db_index=True)
    customer = models.ForeignKey('CustomerDetails', on_delete=models.SET_NULL, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(null=True, blank=True) # Used only for Mkopo/Emergencies

    # Status tracks the overall progress of the debt
    status = models.CharField(
        max_length=10,
        choices=[('PENDING', 'Pending'), ('PARTIAL', 'Partial'), ('PAID', 'Paid')],
        default='PAID'
    )

    @property
    def amount_paid(self):
        # Automatically sums all 'Marejesho' payments
        return self.payments.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')

    @property
    def balance_due(self):
        return self.total_amount - self.amount_paid

    def update_status(self):
        # Logic to auto-update status based on payments
        paid = self.amount_paid
        if paid >= self.total_amount:
            self.status = 'PAID'
        elif paid > 0:
            self.status = 'PARTIAL'
        else:
            self.status = 'PENDING'
        self.save()

    def __str__(self):
        return f"Sale #{self.id} - {self.customer} ({self.status})"

class Payment(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
    date_paid = models.DateTimeField(default=timezone.now)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    reference_id = models.CharField(max_length=100, blank=True, null=True) # e.g., M-Pesa Code

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Every time a payment (Rejesho) is saved, update the Sale status
        self.sale.update_status()

    def __str__(self):
        return f"Payment of {self.amount} for Sale #{self.sale.id}"
=======
from django.db import models
from django.utils import timezone
from django.conf import settings
from decimal import Decimal

class Sale(models.Model):
    sale_date = models.DateTimeField(default=timezone.now, db_index=True)
    customer = models.ForeignKey('CustomerDetails', on_delete=models.SET_NULL, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(null=True, blank=True) # Used only for Mkopo/Emergencies

    # Status tracks the overall progress of the debt
    status = models.CharField(
        max_length=10,
        choices=[('PENDING', 'Pending'), ('PARTIAL', 'Partial'), ('PAID', 'Paid')],
        default='PAID'
    )

    @property
    def amount_paid(self):
        # Automatically sums all 'Marejesho' payments
        return self.payments.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')

    @property
    def balance_due(self):
        return self.total_amount - self.amount_paid

    def update_status(self):
        # Logic to auto-update status based on payments
        paid = self.amount_paid
        if paid >= self.total_amount:
            self.status = 'PAID'
        elif paid > 0:
            self.status = 'PARTIAL'
        else:
            self.status = 'PENDING'
        self.save()

    def __str__(self):
        return f"Sale #{self.id} - {self.customer} ({self.status})"

class Payment(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
    date_paid = models.DateTimeField(default=timezone.now)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    reference_id = models.CharField(max_length=100, blank=True, null=True) # e.g., M-Pesa Code

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Every time a payment (Rejesho) is saved, update the Sale status
        self.sale.update_status()

    def __str__(self):
        return f"Payment of {self.amount} for Sale #{self.sale.id}"
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
