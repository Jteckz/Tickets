from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid
from decimal import Decimal

# ---------------------------
# Custom User Model
# ---------------------------
class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, null=True)

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('provider', 'Provider'),
        ('customer', 'Customer'),
        ('staff', 'Staff'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    created_at = models.DateTimeField(auto_now_add=True)

    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    def __str__(self):
        return self.username

# ---------------------------
# Event Model
# ---------------------------
class Event(models.Model):
    title = models.CharField(max_length=150, default="Untitled Event")
    description = models.TextField(blank=True)
    date = models.DateTimeField(null=True, blank=True)
    venue = models.CharField(max_length=200, default="TBD")
    ticket_price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    tickets_available = models.IntegerField(default=0)
    total_tickets = models.IntegerField(default=0)  # For progress bar
    is_hot = models.BooleanField(default=False)
    image = models.ImageField(upload_to="event_images/", blank=True, null=True)

    provider = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="events",
        null=True,
        blank=True
    )

    def __str__(self):
        return self.title

    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)

# ---------------------------
# Ticket Model
# ---------------------------
class Ticket(models.Model):
    STATUS_CHOICES = (
        ("unused", "Unused"),
        ("used", "Used"),
        ("cancelled", "Cancelled"),
    )

    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="tickets"
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )

    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    provider_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="unused")
    payment_confirmed = models.BooleanField(default=False)  # Future payment integration
    qr_code = models.ImageField(upload_to="tickets_qr/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"Ticket {self.id} - {self.event.title}"

    def save(self, *args, **kwargs):
        # Auto-calculate commission & provider amount if not set
        if self.price and self.commission_amount == 0:
            commission_rate = getattr(settings, "PLATFORM_COMMISSION_PERCENT", 10) / 100
            self.commission_amount = self.price * Decimal(commission_rate)
            self.provider_amount = self.price - self.commission_amount
        super().save(*args, **kwargs)

# ---------------------------
# Transaction Model (Optional for MVP)
# ---------------------------
class Transaction(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='transactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction {self.id}"

# ---------------------------
# Invitation Model
# ---------------------------
class Invitation(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_invitations"
    )
    guest = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_invitations"
    )

    title = models.CharField(max_length=255)
    event_date = models.DateTimeField()
    venue = models.CharField(max_length=255)

    qr_code = models.ImageField(upload_to="invitation_qr/", blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=[("active", "Active"), ("used", "Used")],
        default="active"
    )

    payment_status = models.CharField(
        max_length=20,
        choices=[("free", "Free"), ("paid", "Paid")],
        default="free"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invitation {self.uuid}"
