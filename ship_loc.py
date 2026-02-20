from django.db import models
from django.contrib.auth.models import User

class ShippingAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="shipping_addresses")
    full_name = models.CharField(max_length=255)  # Receiver's name
    phone_number = models.CharField(max_length=15) # Essential for last-mile delivery calls
    building_plot = models.CharField(max_length=255, verbose_name="Building/Plot No.")
    street = models.CharField(max_length=255)
    ward = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    postcode = models.CharField(max_length=5) # e.g., 14111 for Msasani

    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.street}, {self.ward}, {self.region}"


from django.db import models
from mikoa.models import Region # Use the mikoa Region model

class DeliveryAddress(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)

    # Link to django-mikoa to get the 'Zone'
    region = models.ForeignKey(Region, on_delete=models.PROTECT)

    # Use text or your CSV data for specific precision
    district_name = models.CharField(max_length=100)
    ward_name = models.CharField(max_length=100)
    street_name = models.CharField(max_length=100)

    # The 'Bolt' style precision
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    landmark = models.CharField(max_length=255)

    def get_delivery_cost(self):
        # Logic based on the django-mikoa Zone
        zone = self.region.zone
        if zone == 'Lake':
            return 25000
        elif zone == 'Coastal':
            return 5000
        return 15000


from django.db import models
from django.contrib.auth.models import User
from mikoa.models import Region  # From your cloned django-mikoa

class ShippingAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="shipping_addresses")

    # 1. DJANGO-MIKOA (Business Logic & Zones)
    # Link here to get the .zone property for delivery cost calculation
    mikoa_region = models.ForeignKey(Region, on_delete=models.PROTECT, verbose_name="Region")

    # 2. TANZANIA-LOCATIONS (Database Foundation)
    # Use these to store the specific strings from your CSV data
    district = models.CharField(max_length=100)
    ward = models.CharField(max_length=100)
    street = models.CharField(max_length=100)
    postcode = models.CharField(max_length=10, blank=True, null=True)

    # 3. POINT OF INTEREST (The Human Reality)
    # Essential for electronics deliveries to specific houses
    landmark = models.CharField(
        max_length=255,
        help_text="e.g., Near Total Station, opposite the Blue Grocery store"
    )
    house_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Plot/House No.")

    # 4. GPS PINNING (Technical Precision)
    # Store these to generate a Google Maps link for your delivery drivers
    latitude = models.DecimalField(max_digits=22, decimal_places=16, blank=True, null=True)
    longitude = models.DecimalField(max_digits=22, decimal_places=16, blank=True, null=True)

    # Contact (Crucial for the "Last Mile" call)
    phone_number = models.CharField(max_length=15)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.street}, {self.ward} - {self.mikoa_region.name}"

    @property
    def google_maps_link(self):
        """Generates a clickable link for your delivery driver's phone"""
        if self.latitude and self.longitude:
            return f"https://www.google.com{self.latitude},{self.longitude}"
        return None

    def calculate_base_shipping(self):
        """Example: Use django-mikoa 'zone' to determine price"""
        zone_rates = {
            'Coastal': 5000,
            'Lake': 25000,
            'Northern': 15000,
            'Central': 10000,
        }
        return zone_rates.get(self.mikoa_region.zone, 20000)
