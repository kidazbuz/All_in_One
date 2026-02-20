# models.py addition
class QualityCheck(models.Model):
    motherboard = models.ForeignKey(Motherboard, on_delete=models.CASCADE)
    technician = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)
    powers_on = models.BooleanField(default=False)
    hdmi_ports_ok = models.BooleanField(default=False)
    backlight_driver_ok = models.BooleanField(default=False)
    tested_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)


    # views.py (DRF)
    from rest_framework.decorators import action
    from rest_framework.response import Response

    class MotherboardViewSet(viewsets.ModelViewSet):
        @action(detail=True, methods=['post'])
        def mark_passed(self, request, pk=None):
            board = self.get_object()
            # Logic: If all checklist items in request.data are True
            if request.data.get('powers_on') and request.data.get('hdmi_ports_ok'):
                board.status = 'PULLED'  # Move to "Available for Sale"
                board.save()
                return Response({'status': 'Board Approved and listed for sale'})
            return Response({'error': 'Checklist incomplete'}, status=400)
