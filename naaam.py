class ProductSpecificationSerializer(serializers.ModelSerializer):
    # --- 1. Set Mandatory Fields Explicitly (Recommended for clarity) ---
    # These fields are required and will raise an error if not present in the request.
    brand = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        required=True
    )
    actual_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=True
    )
    discounted_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=True
    )
    model = serializers.CharField(
        max_length=255,
        required=True
    )

    # --- 2. Set Optional Fields Explicitly (Based on Model's null=True) ---
    screen_size = serializers.PrimaryKeyRelatedField(
        queryset=ScreenSize.objects.all(),
        required=False,
        allow_null=True # Required if model has null=True
    )
    resolution = serializers.PrimaryKeyRelatedField(
        queryset=SupportedResolution.objects.all(),
        required=False,
        allow_null=True # Required if model has null=True
    )
    panel_type = serializers.PrimaryKeyRelatedField(
        queryset=PanelType.objects.all(),
        required=False,
        allow_null=True # Required if model has null=True
    )

    # M2M field handling
    supported_internet_services = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=SupportedInternetService.objects.all(),
        required=False
    )

    # Nested Serializers
    electrical_specs = ElectricalSpecificationSerializer(required=False)
    product_connectivity = ProductConnectivitySerializer(many=True, required=False)

    class Meta:
        model = ProductSpecification
        fields = '__all__'
        # The fields explicitly defined above (like brand, actual_price, model, etc.)
        # will override the default settings from 'fields = "__all__"'.
        read_only_fields = ('sku',)

    # Validation and create/update methods remain correct

    def validate(self, data):
        # NOTE: data keys might not exist if required=False was used and they weren't passed.
        # Since we set brand/prices/model to required=True above, they will always be in 'data'.

        # Ensure price check is safe if fields were optional (but they are mandatory here)
        if data['actual_price'] < data['discounted_price']:
             # Use the correct import: serializers.ValidationError (not serializer.ValidationError)
            raise serializers.ValidationError({'discounted_price': 'Discounted price must not exceed actual price'})
        return data

    def create(self, validated_data):
        electrical_specs_data = validated_data.pop('electrical_specs', None)
        product_connectivity_data = validated_data.pop('product_connectivity', None)

        # The explicit fields (brand, model, etc.) are already in validated_data
        spec = super().create(validated_data)

        if electrical_specs_data:
            ElectricalSpecification.objects.create(product=spec, **electrical_specs_data)

        if product_connectivity_data:
            for conn_data in product_connectivity_data:
                connectivity_instance = conn_data.pop('connectivity')
                connectivity_id = connectivity_instance.pk

                ProductConnectivity.objects.create(
                    product=spec,
                    connectivity_id=connectivity_id,
                    **conn_data
                )
        return spec

    def update(self, instance, validated_data):
        # ... (update logic for nested serializers is correct and unchanged)

        electrical_specs_data = validated_data.pop('electrical_specs', None)
        product_connectivity_data = validated_data.pop('product_connectivity', None)

        # Update the main ProductSpecification instance
        instance = super().update(instance, validated_data)

        # Handle Electrical Specs (One-to-One, update or create)
        if electrical_specs_data:
            ElectricalSpecification.objects.update_or_create(
                product=instance,
                defaults=electrical_specs_data
            )

        # 4. UPDATE: Handle the list of Product Connectivity objects
        if product_connectivity_data is not None:

            # CRITICAL: Delete all existing connections for this specification first
            ProductConnectivity.objects.filter(product=instance).delete()

            # Then, create the new set of connections
            for conn_data in product_connectivity_data:
                connectivity_instance = conn_data.pop('connectivity')
                connectivity_id = connectivity_instance.pk

                ProductConnectivity.objects.create(
                    product=instance,
                    connectivity_id=connectivity_id, # Set the integer ID
                    **conn_data
                )

        return instance
