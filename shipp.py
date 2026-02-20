class ShippingZone(models.Model):
    # ... your fields (name, post_code, region, district) ...

    @classmethod
    def find_zone_for_address(cls, address):
        """
        Database logic to find the best matching zone.
        Priority: 1. Post Code, 2. Region + District, 3. Region only
        """
        # 1. Try matching by exact Post Code
        if address.post_code:
            zone = cls.objects.filter(post_code=address.post_code, is_active=True).first()
            if zone: return zone

        # 2. Try matching by Region AND District
        zone = cls.objects.filter(
            region__iexact=address.region,
            district__iexact=address.district,
            is_active=True
        ).first()
        if zone: return zone

        # 3. Fallback to Region only
        return cls.objects.filter(
            region__iexact=address.region,
            district__isnull=True,
            is_active=True
        ).first()



        class ShippingRate(models.Model):
            # ... your fields ...

            @classmethod
            def get_rate_for_shipment(cls, method, zone, weight):
                """
                Finds the specific rate row for a given weight and shipping method.
                """
                return cls.objects.filter(
                    method=method,
                    zone=zone,
                    min_weight_kg__lte=weight
                ).filter(
                    models.Q(max_weight_kg__gte=weight) | models.Q(max_weight_kg__isnull=True)
                ).first()


                class ShipmentLineItem(models.Model):
                    # ... your fields ...

                    def save(self, *args, **kwargs):
                        # Validation: Quantity in shipment cannot exceed quantity in Order
                        if self.quantity > self.order_item.quantity:
                            raise ValueError(f"Cannot ship {self.quantity} units. Only {self.order_item.quantity} were ordered.")

                        # Auto-calculate weight based on unit weight if not provided
                        if not self.weight and self.order_item.product.weight:
                            self.weight = self.order_item.product.weight * self.quantity

                        super().save(*args, **kwargs)
