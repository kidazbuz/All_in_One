<<<<<<< HEAD
import socket
from smtplib import SMTPException, SMTPConnectError, SMTPAuthenticationError
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

def handle_mail_exception(e):
    """Helper to categorize mail errors."""
    if isinstance(e, (socket.gaierror, socket.timeout, SMTPConnectError)):
        return False, "Network error: Connection to mail server failed. Check internet/SMTP settings."
    elif isinstance(e, SMTPAuthenticationError):
        return False, "Mail Authentication failed: Check SMTP credentials."
    elif isinstance(e, SMTPException):
        return False, f"Mail delivery error: {str(e)}"
    return False, f"Unexpected error occurred: {str(e)}"

def send_otp_email(otp_entry):
    try:
        recipient_email = otp_entry.user.email
        context = {
            'greeting': f"Habari {otp_entry.user.first_name or ''}".strip(),
            'otp_code': otp_entry.code,
            'token_type': otp_entry.token_type,
            'expiration_min': settings.OTP_EXPIRATION_TIME // 60,
        }
        html_content = render_to_string('emails/otp_email.html', context)
        email = EmailMultiAlternatives(
            f"Verification Code: {otp_entry.code} - Daz Electronics",
            strip_tags(html_content),
            settings.DEFAULT_FROM_EMAIL,
            [recipient_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        return True, "OTP sent successfully."
    except Exception as e:
        return handle_mail_exception(e)

def send_forgot_password_link_email(user, reset_link):
    try:
        context = {
            'greeting': f"Habari {user.get_full_name() or 'Mteja'}",
            'reset_link': reset_link,
            'frontend_url': settings.FRONTEND_URL,
        }
        html_content = render_to_string('emails/password_reset.html', context)
        email = EmailMultiAlternatives(
            "Reset Your Password - Daz Electronics",
            strip_tags(html_content),
            settings.DEFAULT_FROM_EMAIL,
            [user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.extra_headers = {'X-Priority': '1 (Highest)', 'Importance': 'High'}
        email.send(fail_silently=False)
        return True, "Reset link sent successfully."
    except Exception as e:
        return handle_mail_exception(e)

def email_to_staff(user_instance, password):
    try:
        context = {
            'greeting': f"Dear {user_instance.get_full_name() or 'Staff'}",
            'login_url': f'{settings.FRONTEND_URL}/api/auth/login',
            'username': user_instance.email,
            'password': password,
        }
        html_content = render_to_string('emails/staff_welcome.html', context)
        email = EmailMultiAlternatives(
            "Welcome to Daz Electronics - Staff Account Created",
            strip_tags(html_content),
            settings.DEFAULT_FROM_EMAIL,
            [user_instance.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        return True, "Staff credentials sent."
    except Exception as e:
        return handle_mail_exception(e)

def email_daily_closure_to_ceo(summary_instance):
    try:
        ceo_user = User.objects.filter(groups__name='Chief Executive Officer (CEO)').first()
        ceo_email = ceo_user.email if ceo_user else settings.ADMIN_EMAIL

        context = {
            'summary': summary_instance,
            'agent_name': summary_instance.sales_agent.get_full_name(),
            'date': summary_instance.closing_date,
        }
        html_content = render_to_string('emails/closure.html', context)
        email = EmailMultiAlternatives(
            f"Daily Sales Closure - {summary_instance.closing_date}",
            strip_tags(html_content),
            settings.DEFAULT_FROM_EMAIL,
            [ceo_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        return True, "CEO notified successfully."
    except Exception as e:
        return handle_mail_exception(e)
=======
import socket
from smtplib import SMTPException, SMTPConnectError, SMTPAuthenticationError
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

def handle_mail_exception(e):
    """Helper to categorize mail errors."""
    if isinstance(e, (socket.gaierror, socket.timeout, SMTPConnectError)):
        return False, "Network error: Connection to mail server failed. Check internet/SMTP settings."
    elif isinstance(e, SMTPAuthenticationError):
        return False, "Mail Authentication failed: Check SMTP credentials."
    elif isinstance(e, SMTPException):
        return False, f"Mail delivery error: {str(e)}"
    return False, f"Unexpected error occurred: {str(e)}"

def send_otp_email(otp_entry):
    try:
        recipient_email = otp_entry.user.email
        context = {
            'greeting': f"Habari {otp_entry.user.first_name or ''}".strip(),
            'otp_code': otp_entry.code,
            'token_type': otp_entry.token_type,
            'expiration_min': settings.OTP_EXPIRATION_TIME // 60,
        }
        html_content = render_to_string('emails/otp_email.html', context)
        email = EmailMultiAlternatives(
            f"Verification Code: {otp_entry.code} - Daz Electronics",
            strip_tags(html_content),
            settings.DEFAULT_FROM_EMAIL,
            [recipient_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        return True, "OTP sent successfully."
    except Exception as e:
        return handle_mail_exception(e)

def send_forgot_password_link_email(user, reset_link):
    try:
        context = {
            'greeting': f"Habari {user.get_full_name() or 'Mteja'}",
            'reset_link': reset_link,
            'frontend_url': settings.FRONTEND_URL,
        }
        html_content = render_to_string('emails/password_reset.html', context)
        email = EmailMultiAlternatives(
            "Reset Your Password - Daz Electronics",
            strip_tags(html_content),
            settings.DEFAULT_FROM_EMAIL,
            [user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.extra_headers = {'X-Priority': '1 (Highest)', 'Importance': 'High'}
        email.send(fail_silently=False)
        return True, "Reset link sent successfully."
    except Exception as e:
        return handle_mail_exception(e)

def email_to_staff(user_instance, password):
    try:
        context = {
            'greeting': f"Dear {user_instance.get_full_name() or 'Staff'}",
            'login_url': f'{settings.FRONTEND_URL}/api/auth/login',
            'username': user_instance.email,
            'password': password,
        }
        html_content = render_to_string('emails/staff_welcome.html', context)
        email = EmailMultiAlternatives(
            "Welcome to Daz Electronics - Staff Account Created",
            strip_tags(html_content),
            settings.DEFAULT_FROM_EMAIL,
            [user_instance.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        return True, "Staff credentials sent."
    except Exception as e:
        return handle_mail_exception(e)

def email_daily_closure_to_ceo(summary_instance):
    try:
        ceo_user = User.objects.filter(groups__name='Chief Executive Officer (CEO)').first()
        ceo_email = ceo_user.email if ceo_user else settings.ADMIN_EMAIL

        context = {
            'summary': summary_instance,
            'agent_name': summary_instance.sales_agent.get_full_name(),
            'date': summary_instance.closing_date,
        }
        html_content = render_to_string('emails/closure.html', context)
        email = EmailMultiAlternatives(
            f"Daily Sales Closure - {summary_instance.closing_date}",
            strip_tags(html_content),
            settings.DEFAULT_FROM_EMAIL,
            [ceo_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        return True, "CEO notified successfully."
    except Exception as e:
        return handle_mail_exception(e)
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
