from rest_framework import serializers

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    # Read-only extras so the React page can show the job name and company.
    job_title = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "job_title",
            "company",
            "status",
            "applied_at",
        ]
        # The client may only send "job". Everything else is set by the server.
        read_only_fields = ["id", "status", "applied_at"]

    def get_job_title(self, obj):
        return getattr(obj.job, "title", None) or str(obj.job)

    def get_company(self, obj):
        company = getattr(obj.job, "company", None)
        return str(company) if company else ""

    def validate_job(self, job):
        user = self.context["request"].user
        if Application.objects.filter(user=user, job=job).exists():
            raise serializers.ValidationError(
                "You have already applied for this job."
            )
        return job
