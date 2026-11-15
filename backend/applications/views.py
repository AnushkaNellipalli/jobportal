from django.db import IntegrityError
from rest_framework import mixins, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Application
from .serializers import ApplicationSerializer


class ApplicationViewSet(
    mixins.CreateModelMixin,   # POST /api/applications/  -> apply
    mixins.ListModelMixin,     # GET  /api/applications/  -> my applications
    viewsets.GenericViewSet,
):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]  # must be logged in

    def get_queryset(self):
        # Only the logged-in user's applications, never anyone else's.
        return Application.objects.filter(user=self.request.user).select_related("job")

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            # Safety net if two requests arrive at the same instant.
            raise ValidationError({"job": ["You have already applied for this job."]})
