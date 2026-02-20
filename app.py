from django.db import models
from django.contrib.auth.models import User # Use Django's built-in User model for assignments

# Status Choices for Features and Tasks
class Status(models.TextChoices):
    TODO = 'TODO', 'To Do'
    IN_PROGRESS = 'INP', 'In Progress'
    REVIEW = 'REV', 'In Review'
    DONE = 'DONE', 'Done'
    BLOCKED = 'BLOCKED', 'Blocked'

# Priority Choices for Features and Tasks
class Priority(models.TextChoices):
    LOW = 'L', 'Low'
    MEDIUM = 'M', 'Medium'
    HIGH = 'H', 'High'
    CRITICAL = 'C', 'Critical'


class Project(models.Model):
    """Represents a major software product or application."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='owned_projects')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Release(models.Model):
    """A specific version or target date for a project (e.g., v1.0.0, Q4-2024)."""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='releases')
    version_name = models.CharField(max_length=50) # e.g., "1.0.0" or "Hotfix-20241127"
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('project', 'version_name')
        ordering = ['due_date', 'version_name']

    def __str__(self):
        return f'{self.project.name} - {self.version_name}'

class Feature(models.Model):
    """A user story or large piece of functionality (an Epic or Feature)."""
    release = models.ForeignKey(Release, on_delete=models.CASCADE, related_name='features')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.TODO)
    priority = models.CharField(max_length=1, choices=Priority.choices, default=Priority.MEDIUM)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_features')

    def __str__(self):
        return f'Feature: {self.title} ({self.status})'

class Task(models.Model):
    """A granular unit of work required to complete a Feature."""
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.TODO)
    priority = models.CharField(max_length=1, choices=Priority.choices, default=Priority.LOW)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')

    def __str__(self):
        return f'Task: {self.title} ({self.status})'
