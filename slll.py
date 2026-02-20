<<<<<<< HEAD
# views.py in your sales app

from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from .models import Sale, DailySummary # Ensure Sale and DailySummary are imported
# Assuming Expense model is in the current app, otherwise adjust import
from .models import Expense

@action(detail=False, methods=['post'], url_path='close-day')
def close_day_sales(self, request):
    user = request.user
    today = timezone.now().date()

    # 1. Role Check: Only regular Sales Agents can run this endpoint for their own closure
    if user.is_superuser or user.is_staff:
        # Assuming staff/managers have a different report/closure mechanism
        return Response(
            {"detail": "This closure endpoint is for Sales Agents only."},
            status=status.HTTP_403_FORBIDDEN
        )

    summary_agent = user

    # 2. Prevent Double Closure (Agent-Specific Check)
    if DailySummary.objects.filter(closing_date=today, sales_agent=summary_agent).exists():
        return Response(
            {"detail": f"Your sales for {today} have already been closed."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- 3. Calculate Revenue Metrics ---

    # Base filter for completed sales today by this agent
    base_sales_filter = Q(
        sale_date__date=today,
        sales_agent=user,
        payment_status='Completed'
    )

    sales_to_close = Sale.objects.filter(base_sales_filter)

    if not sales_to_close.exists():
        return Response(
            {"detail": f"No completed sales found for you today to close."},
            status=status.HTTP_200_OK
        )

    # 3a. Total Revenue (All payment methods)
    revenue_summary = sales_to_close.aggregate(
        total_revenue=Sum('total_amount'),
        total_sales_count=Count('id')
    )

    # 3b. Total Cash Sales (The money available for expenses)
    cash_sales_summary = sales_to_close.filter(payment_method='CASH').aggregate(
        total_cash_sales=Sum('total_amount')
    )

    total_revenue = revenue_summary['total_revenue'] or 0.00
    total_sales_count = revenue_summary['total_sales_count'] or 0
    total_cash_sales = cash_sales_summary['total_cash_sales'] or 0.00


    # --- 4. Calculate Cash Expenses ---

    # Filter expenses logged by this agent today AND paid using CASH
    expense_summary = Expense.objects.filter(
        expense_date=today,
        user=user, # The 'user' field in Expense model corresponds to the Sales Agent
        payment_method='Cash' # Filter only CASH payments from the agent's sales money
    ).aggregate(
        total_cash_expense_amount=Sum('amount')
    )

    total_cash_expenses = expense_summary['total_cash_expense_amount'] or 0.00

    # 5. Calculate Net Cash Settlement
    # This is the amount the agent owes the business (Cash Sales - Cash Expenses)
    net_cash_settlement = total_cash_sales - total_cash_expenses

    # 6. Create Daily Summary Record
    DailySummary.objects.create(
        closing_date=today,
        sales_agent=summary_agent,
        total_sales_count=total_sales_count,
        total_revenue=total_revenue,
        total_cash_sales=total_cash_sales,
        total_cash_expenses=total_cash_expenses,
        net_cash_settlement=net_cash_settlement,
        closed_by=user
    )

    return Response({
        "detail": f"Your daily sales closed successfully for {today}.",
        "summary": {
            "total_cash_sales": total_cash_sales,
            "total_cash_expenses": total_cash_expenses,
            "net_cash_settlement": net_cash_settlement
        }
    }, status=status.HTTP_201_CREATED)
=======
# views.py in your sales app

from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from .models import Sale, DailySummary # Ensure Sale and DailySummary are imported
# Assuming Expense model is in the current app, otherwise adjust import
from .models import Expense

@action(detail=False, methods=['post'], url_path='close-day')
def close_day_sales(self, request):
    user = request.user
    today = timezone.now().date()

    # 1. Role Check: Only regular Sales Agents can run this endpoint for their own closure
    if user.is_superuser or user.is_staff:
        # Assuming staff/managers have a different report/closure mechanism
        return Response(
            {"detail": "This closure endpoint is for Sales Agents only."},
            status=status.HTTP_403_FORBIDDEN
        )

    summary_agent = user

    # 2. Prevent Double Closure (Agent-Specific Check)
    if DailySummary.objects.filter(closing_date=today, sales_agent=summary_agent).exists():
        return Response(
            {"detail": f"Your sales for {today} have already been closed."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- 3. Calculate Revenue Metrics ---

    # Base filter for completed sales today by this agent
    base_sales_filter = Q(
        sale_date__date=today,
        sales_agent=user,
        payment_status='Completed'
    )

    sales_to_close = Sale.objects.filter(base_sales_filter)

    if not sales_to_close.exists():
        return Response(
            {"detail": f"No completed sales found for you today to close."},
            status=status.HTTP_200_OK
        )

    # 3a. Total Revenue (All payment methods)
    revenue_summary = sales_to_close.aggregate(
        total_revenue=Sum('total_amount'),
        total_sales_count=Count('id')
    )

    # 3b. Total Cash Sales (The money available for expenses)
    cash_sales_summary = sales_to_close.filter(payment_method='CASH').aggregate(
        total_cash_sales=Sum('total_amount')
    )

    total_revenue = revenue_summary['total_revenue'] or 0.00
    total_sales_count = revenue_summary['total_sales_count'] or 0
    total_cash_sales = cash_sales_summary['total_cash_sales'] or 0.00


    # --- 4. Calculate Cash Expenses ---

    # Filter expenses logged by this agent today AND paid using CASH
    expense_summary = Expense.objects.filter(
        expense_date=today,
        user=user, # The 'user' field in Expense model corresponds to the Sales Agent
        payment_method='Cash' # Filter only CASH payments from the agent's sales money
    ).aggregate(
        total_cash_expense_amount=Sum('amount')
    )

    total_cash_expenses = expense_summary['total_cash_expense_amount'] or 0.00

    # 5. Calculate Net Cash Settlement
    # This is the amount the agent owes the business (Cash Sales - Cash Expenses)
    net_cash_settlement = total_cash_sales - total_cash_expenses

    # 6. Create Daily Summary Record
    DailySummary.objects.create(
        closing_date=today,
        sales_agent=summary_agent,
        total_sales_count=total_sales_count,
        total_revenue=total_revenue,
        total_cash_sales=total_cash_sales,
        total_cash_expenses=total_cash_expenses,
        net_cash_settlement=net_cash_settlement,
        closed_by=user
    )

    return Response({
        "detail": f"Your daily sales closed successfully for {today}.",
        "summary": {
            "total_cash_sales": total_cash_sales,
            "total_cash_expenses": total_cash_expenses,
            "net_cash_settlement": net_cash_settlement
        }
    }, status=status.HTTP_201_CREATED)
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
