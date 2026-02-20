<<<<<<< HEAD
from rest_framework import serializers
from .models import Account, Category, Transaction, SavingsGoal

# --- 1. ACCOUNT SERIALIZER ---
class AccountSerializer(serializers.ModelSerializer):
    # Read-only field to display the User's username instead of their ID
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Account
        # Fields to be included in the serialized output (JSON)
        fields = [
            'id', 'user', 'user_name', 'account_name', 'account_type',
            'current_balance', 'is_active'
        ]
        # Prevents the 'user' field from being modified directly via the API
        read_only_fields = ('user',)

# --- 2. CATEGORY SERIALIZER ---
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'user', 'category_name', 'category_type'
        ]
        read_only_fields = ('user',)


# --- 3. TRANSACTION SERIALIZER ---
class TransactionSerializer(serializers.ModelSerializer):
    # Display human-readable names instead of Foreign Key IDs
    account_name = serializers.CharField(source='account.account_name', read_only=True)
    category_name = serializers.CharField(source='category.category_name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'account', 'account_name', 'category', 'category_name',
            'amount', 'transaction_date', 'transaction_type', 'description', 'notes'
        ]
        read_only_fields = ('user',)


# --- 4. SAVINGS GOAL SERIALIZER ---
class SavingsGoalSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.account_name', read_only=True)

    class Meta:
        model = SavingsGoal
        fields = [
            'id', 'user', 'goal_name', 'target_amount', 'current_amount',
            'target_date', 'account', 'account_name', 'is_achieved'
        ]
        read_only_fields = ('user',)
=======
from rest_framework import serializers
from .models import Account, Category, Transaction, SavingsGoal

# --- 1. ACCOUNT SERIALIZER ---
class AccountSerializer(serializers.ModelSerializer):
    # Read-only field to display the User's username instead of their ID
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Account
        # Fields to be included in the serialized output (JSON)
        fields = [
            'id', 'user', 'user_name', 'account_name', 'account_type',
            'current_balance', 'is_active'
        ]
        # Prevents the 'user' field from being modified directly via the API
        read_only_fields = ('user',)

# --- 2. CATEGORY SERIALIZER ---
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'user', 'category_name', 'category_type'
        ]
        read_only_fields = ('user',)


# --- 3. TRANSACTION SERIALIZER ---
class TransactionSerializer(serializers.ModelSerializer):
    # Display human-readable names instead of Foreign Key IDs
    account_name = serializers.CharField(source='account.account_name', read_only=True)
    category_name = serializers.CharField(source='category.category_name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'account', 'account_name', 'category', 'category_name',
            'amount', 'transaction_date', 'transaction_type', 'description', 'notes'
        ]
        read_only_fields = ('user',)


# --- 4. SAVINGS GOAL SERIALIZER ---
class SavingsGoalSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.account_name', read_only=True)

    class Meta:
        model = SavingsGoal
        fields = [
            'id', 'user', 'goal_name', 'target_amount', 'current_amount',
            'target_date', 'account', 'account_name', 'is_achieved'
        ]
        read_only_fields = ('user',)
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
