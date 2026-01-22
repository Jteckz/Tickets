from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Event, Ticket, Invitation
import uuid

class APITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create Users
        self.admin_user = User.objects.create_superuser(username='admin', password='password123', role='admin')
        self.provider_user = User.objects.create_user(username='provider', password='password123', role='provider')
        self.customer_user = User.objects.create_user(username='customer', password='password123', role='customer')
        self.staff_user = User.objects.create_user(username='staff', password='password123', role='staff')

        # Create Event
        self.event = Event.objects.create(
            title="Test Concert",
            tickets_available=10,
            provider=self.provider_user,
            date="2025-12-31 20:00:00"
        )

    # --- User Tests ---
    def test_get_users(self):
        url = reverse('users-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 4) # We created 4 users

    # --- Event Tests ---
    def test_create_event_as_provider(self):
        self.client.force_authenticate(user=self.provider_user)
        url = reverse('events-list')
        data = {
            "title": "New Festival",
            "tickets_available": 100,
            "venue": "Central Park",
            "provider": self.provider_user.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Event.objects.count(), 2)

    # --- Ticket Tests ---
    def test_buy_ticket_success(self):
        url = reverse('tickets-list')
        data = {
            "event": self.event.id,
            "user": self.customer_user.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.event.refresh_from_db()
        self.assertEqual(self.event.tickets_available, 9) # Decremented

    def test_buy_ticket_sold_out(self):
        self.event.tickets_available = 0
        self.event.save()
        url = reverse('tickets-list')
        data = {"event": self.event.id, "user": self.customer_user.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_ticket(self):
        # Create a ticket manually
        ticket = Ticket.objects.create(
            event=self.event,
            buyer=self.customer_user,
            price=50.00,
            payment_confirmed=True # Must be confirmed to verify
        )
        url = reverse('ticket-verify')
        data = {"ticket_id": str(ticket.id)}
        
        # Verify first time
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'used')

        # Verify second time (should fail)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # --- Dashboard Tests ---
    def test_provider_dashboard(self):
        self.client.force_authenticate(user=self.provider_user)
        url = reverse('provider-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_earnings", response.data)

    def test_admin_dashboard(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_users", response.data)

    # --- Invitation Tests ---
    def test_create_invitation(self):
        url = reverse('invitation-list')
        data = {
            "title": "VIP Party",
            "event_date": "2025-12-31T20:00:00Z",
            "venue": "Luxury Hall",
            "creator": self.admin_user.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Invitation.objects.exists())
