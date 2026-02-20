from django.db import models
from django.contrib.auth.models import User # Required for multi-user support

# --- 1. ACCOUNTS TABLE ---
class Account(models.Model):
    # Choices for AccountType
    ACCOUNT_TYPES = [
        ('CHECKING', 'Checking'),
        ('SAVINGS', 'Savings'),
        ('CREDIT', 'Credit Card'),
        ('CASH', 'Cash'),
        ('INVESTMENT', 'Investment'),
    ]

    # Link each account to a User (ForeignKey creates the one-to-many relationship)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    account_name = models.CharField(max_length=255)
    account_type = models.CharField(max_length=50, choices=ACCOUNT_TYPES)
    # DecimalField is the appropriate type for currency
    current_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.account_name} ({self.account_type}) - ${self.current_balance}"

    class Meta:
        # Ensures a user cannot have two accounts with the exact same name
        unique_together = ('user', 'account_name')

# --- 2. CATEGORIES TABLE ---
class Category(models.Model):
    # Choices for CategoryType
    CATEGORY_KINDS = [
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category_name = models.CharField(max_length=255)
    category_type = models.CharField(max_length=50, choices=CATEGORY_KINDS)

    def __str__(self):
        return f"{self.category_name} ({self.category_type})"

    class Meta:
        # Ensures a user cannot have two categories with the exact same name
        unique_together = ('user', 'category_name')


# --- 3. TRANSACTIONS TABLE ---
class Transaction(models.Model):
    # Choices for TransactionType (used for reporting)
    TRANSACTION_TYPES = [
        ('EXPENSE', 'Expense'),
        ('INCOME', 'Income'),
        ('TRANSFER', 'Transfer'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # Foreign Keys link to the parent models
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateTimeField()
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.transaction_date.strftime('%Y-%m-%d')} - {self.description} (${self.amount})"

    class Meta:
        ordering = ['-transaction_date'] # Default order for lists (most recent first)


# --- 4. SAVINGS GOALS TABLE ---
class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    goal_name = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    # Current amount will be updated by saving transactions
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    target_date = models.DateField(null=True, blank=True)

    # Optional: Link to a specific savings account
    account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='savings_goals')
    is_achieved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.goal_name} - {self.current_amount}/{self.target_amount}"
