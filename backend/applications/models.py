from django.conf import settings
from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_REVIEW = "in_review", "In Review"
        SHORTLISTED = "shortlisted", "Shortlisted"
        REJECTED = "rejected", "Rejected"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    # CHANGE "jobs.Job" if your Job model lives in a different app
    # (format is "app_label.ModelName").
    job = models.ForeignKey(
        "jobs.Job",
        on_delete=models.CASCADE,
        related_name="applications",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-applied_at"]
        constraints = [
            # The database itself refuses a second application
            # for the same user + job.
            models.UniqueConstraint(
                fields=["user", "job"],
                name="unique_application_per_user_and_job",
            )
        ]

    def __str__(self):
        return f"{self.user} -> {self.job} ({self.status})"
