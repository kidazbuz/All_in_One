<<<<<<< HEAD
class PublicProductSpecificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Returns a FLAT LIST of all available Product Specifications (models/SKUs).
    """
    queryset = ProductSpecification.objects.all()
    serializer_class = PublicProductSpecificationSerializer
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductSpecificationFilter

    ordering_fields = [
        'actual_price', 'discounted_price', 'model',
        'product__name', 'brand__name', 'created_at'
    ]
    ordering = ['?']

    search_fields = [
        'model', 'sku', 'color',
        'screen_size__name', 'resolution__name', 'panel_type__name',
        'product__name', 'brand__name', 'product__category__name', 'product__description',
        'supported_internet_services__name',
    ]

    def get_queryset(self):
        queryset = ProductSpecification.objects.all()
        queryset = queryset.filter(product__is_active=True)
        inventory_prefetch = Prefetch('inventory')

        category_ids = queryset.values_list('product__category__id', flat = True).distinct()
        final_ids = []

        for cat_id in category_ids:
            limit = random.randomint(6, 10)

            cat_ids = (queryset.filter(product__category__id=cat_id).order_by('?')
                    .values_list('id', flat = True)[:limit])

            final_ids.extend(list(cat_ids))

        queryset = ProductSpecification.objects.filter(id__in = final_ids)

        queryset = queryset.prefetch_related(
            'productimage_set',
            'productvideo_set',
            'productconnectivity_set',
            'supported_internet_services',
            'electrical_specs',
            inventory_prefetch
        ).select_related(
            'product',
            'screen_size',
            'resolution',
            'panel_type',
            'brand'
        ).order_by('?')

        return queryset
=======
class PublicProductSpecificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Returns a FLAT LIST of all available Product Specifications (models/SKUs).
    """
    queryset = ProductSpecification.objects.all()
    serializer_class = PublicProductSpecificationSerializer
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductSpecificationFilter

    ordering_fields = [
        'actual_price', 'discounted_price', 'model',
        'product__name', 'brand__name', 'created_at'
    ]
    ordering = ['?']

    search_fields = [
        'model', 'sku', 'color',
        'screen_size__name', 'resolution__name', 'panel_type__name',
        'product__name', 'brand__name', 'product__category__name', 'product__description',
        'supported_internet_services__name',
    ]

    def get_queryset(self):
        queryset = ProductSpecification.objects.all()
        queryset = queryset.filter(product__is_active=True)
        inventory_prefetch = Prefetch('inventory')

        category_ids = queryset.values_list('product__category__id', flat = True).distinct()
        final_ids = []

        for cat_id in category_ids:
            limit = random.randomint(6, 10)

            cat_ids = (queryset.filter(product__category__id=cat_id).order_by('?')
                    .values_list('id', flat = True)[:limit])

            final_ids.extend(list(cat_ids))

        queryset = ProductSpecification.objects.filter(id__in = final_ids)

        queryset = queryset.prefetch_related(
            'productimage_set',
            'productvideo_set',
            'productconnectivity_set',
            'supported_internet_services',
            'electrical_specs',
            inventory_prefetch
        ).select_related(
            'product',
            'screen_size',
            'resolution',
            'panel_type',
            'brand'
        ).order_by('?')

        return queryset
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
