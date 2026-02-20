<<<<<<< HEAD
# 4. The Main Combined Serializer (Modified with update method)
class UserCreationSerializer(serializers.Serializer):
    # ... (User Model Fields remain the same) ...
    phone_number = PhoneNumberField(region='TZ')
    second_phone_number = PhoneNumberField(required=False, allow_null=True)
    first_name = serializers.CharField(max_length=30)
    middle_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField(required=False, allow_null=True)

    # Nested Address and NextOfKin Fields (Using the modified serializers)
    address = AddressSerializer()
    next_of_kin = NextOfKinSerializer()

    # ... (The validate_phone_number method and create() method remain the same) ...

    # --- NEW UPDATE METHOD ---
    def update(self, instance, validated_data):
        # 1. Pop nested data
        address_data = validated_data.pop('address')
        next_of_kin_data = validated_data.pop('next_of_kin')

        with transaction.atomic():
            # 2. Update the main User instance (instance is the existing User object)
            instance.phone_number = validated_data.get('phone_number', instance.phone_number)
            instance.second_phone_number = validated_data.get('second_phone_number', instance.second_phone_number)
            instance.first_name = validated_data.get('first_name', instance.first_name)
            instance.middle_name = validated_data.get('middle_name', instance.middle_name)
            instance.last_name = validated_data.get('last_name', instance.last_name)
            instance.email = validated_data.get('email', instance.email)
            instance.save()

            # 3. Handle Address Update or Creation
            self._handle_nested_update(
                model=Address,
                data=address_data,
                user=instance,
                relation_model=UserAddress,
                relation_field='address'
            )

            # 4. Handle NextOfKin Update or Creation
            self._handle_nested_update(
                model=NextOfKin,
                data=next_of_kin_data,
                user=instance,
                relation_model=None, # NextOfKin is directly linked to User
                relation_field=None
            )

        return instance

    def _handle_nested_update(self, model, data, user, relation_model, relation_field):
        """Helper to either create or update a nested model (Address or NextOfKin)."""
        nested_id = data.get('id')

        if nested_id:
            # UPDATE: If an ID is provided, fetch and update the existing object
            try:
                nested_instance = model.objects.get(pk=nested_id)
                for attr, value in data.items():
                    setattr(nested_instance, attr, value)
                nested_instance.save()
            except model.DoesNotExist:
                raise serializers.ValidationError(f"{model.__name__} with ID {nested_id} does not exist.")
        else:
            # CREATE: If no ID is provided, create a new object
            nested_instance = model.objects.create(**data)

            # For NextOfKin, directly link it
            if model == NextOfKin:
                NextOfKin.objects.filter(user=user).update(user=None) # Optional: clear old NOK, or just create new one
                nested_instance.user = user
                nested_instance.save()

            # For Address, link it via the UserAddress intermediary model
            elif relation_model == UserAddress:
                # Create the intermediary linkage
                relation_model.objects.create(
                    user=user,
                    **{relation_field: nested_instance},
                    is_default=True # Assuming a new address is the default
                )
=======
# 4. The Main Combined Serializer (Modified with update method)
class UserCreationSerializer(serializers.Serializer):
    # ... (User Model Fields remain the same) ...
    phone_number = PhoneNumberField(region='TZ')
    second_phone_number = PhoneNumberField(required=False, allow_null=True)
    first_name = serializers.CharField(max_length=30)
    middle_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField(required=False, allow_null=True)

    # Nested Address and NextOfKin Fields (Using the modified serializers)
    address = AddressSerializer()
    next_of_kin = NextOfKinSerializer()

    # ... (The validate_phone_number method and create() method remain the same) ...

    # --- NEW UPDATE METHOD ---
    def update(self, instance, validated_data):
        # 1. Pop nested data
        address_data = validated_data.pop('address')
        next_of_kin_data = validated_data.pop('next_of_kin')

        with transaction.atomic():
            # 2. Update the main User instance (instance is the existing User object)
            instance.phone_number = validated_data.get('phone_number', instance.phone_number)
            instance.second_phone_number = validated_data.get('second_phone_number', instance.second_phone_number)
            instance.first_name = validated_data.get('first_name', instance.first_name)
            instance.middle_name = validated_data.get('middle_name', instance.middle_name)
            instance.last_name = validated_data.get('last_name', instance.last_name)
            instance.email = validated_data.get('email', instance.email)
            instance.save()

            # 3. Handle Address Update or Creation
            self._handle_nested_update(
                model=Address,
                data=address_data,
                user=instance,
                relation_model=UserAddress,
                relation_field='address'
            )

            # 4. Handle NextOfKin Update or Creation
            self._handle_nested_update(
                model=NextOfKin,
                data=next_of_kin_data,
                user=instance,
                relation_model=None, # NextOfKin is directly linked to User
                relation_field=None
            )

        return instance

    def _handle_nested_update(self, model, data, user, relation_model, relation_field):
        """Helper to either create or update a nested model (Address or NextOfKin)."""
        nested_id = data.get('id')

        if nested_id:
            # UPDATE: If an ID is provided, fetch and update the existing object
            try:
                nested_instance = model.objects.get(pk=nested_id)
                for attr, value in data.items():
                    setattr(nested_instance, attr, value)
                nested_instance.save()
            except model.DoesNotExist:
                raise serializers.ValidationError(f"{model.__name__} with ID {nested_id} does not exist.")
        else:
            # CREATE: If no ID is provided, create a new object
            nested_instance = model.objects.create(**data)

            # For NextOfKin, directly link it
            if model == NextOfKin:
                NextOfKin.objects.filter(user=user).update(user=None) # Optional: clear old NOK, or just create new one
                nested_instance.user = user
                nested_instance.save()

            # For Address, link it via the UserAddress intermediary model
            elif relation_model == UserAddress:
                # Create the intermediary linkage
                relation_model.objects.create(
                    user=user,
                    **{relation_field: nested_instance},
                    is_default=True # Assuming a new address is the default
                )
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
