from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Event, Ticket, User


class TicketPlatformApiTests(APITestCase):
    def setUp(self):
        self.provider = User.objects.create_user(username="provider", password="pass1234", role="provider")
        self.customer = User.objects.create_user(username="customer", password="pass1234", role="customer")
        self.staff = User.objects.create_user(username="staff", password="pass1234", role="staff")

        self.event = Event.objects.create(
            title="Launch Night",
            description="Premium event",
            venue="Nairobi Arena",
            tickets_available=5,
            total_tickets=5,
            ticket_price=100,
            provider=self.provider,
        )

    def test_customer_can_register_and_login(self):
        register_url = reverse("register")
        payload = {
            "username": "new_customer",
            "email": "new@example.com",
            "password": "pass1234",
            "role": "customer",
        }
        register_res = self.client.post(register_url, payload, format="json")
        self.assertEqual(register_res.status_code, status.HTTP_201_CREATED)

        login_res = self.client.post(reverse("login"), {"username": "new_customer", "password": "pass1234"}, format="json")
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_res.data)
        self.assertIn("refresh", login_res.data)

    def test_provider_can_create_event(self):
        self.client.force_authenticate(self.provider)
        response = self.client.post(
            reverse("events-list"),
            {
                "title": "Provider Event",
                "description": "Details",
                "venue": "Venue",
                "tickets_available": 20,
                "total_tickets": 20,
                "ticket_price": "49.99",
                "is_hot": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Event.objects.filter(provider=self.provider).count(), 2)

    def test_customer_cannot_create_event(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post(reverse("events-list"), {"title": "Nope"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_can_book_ticket_with_qr(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post(reverse("book-ticket", kwargs={"pk": self.event.id}), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ticket = Ticket.objects.get(id=response.data["id"])
        self.assertIsNotNone(ticket.qr_code)
        self.event.refresh_from_db()
        self.assertEqual(self.event.tickets_available, 4)

    def test_only_staff_can_verify_ticket(self):
        ticket = Ticket.objects.create(event=self.event, buyer=self.customer, price=100, payment_confirmed=True, is_active=True)

        self.client.force_authenticate(self.customer)
        customer_res = self.client.post(reverse("verify-ticket"), {"ticket_id": ticket.id}, format="json")
        self.assertEqual(customer_res.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.staff)
        staff_res = self.client.post(reverse("verify-ticket"), {"ticket_id": ticket.id}, format="json")
        self.assertEqual(staff_res.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, "used")

    def test_provider_dashboard_data(self):
        Ticket.objects.create(event=self.event, buyer=self.customer, price=100, payment_confirmed=True, is_active=True)
        self.client.force_authenticate(self.provider)
        response = self.client.get(reverse("provider-dashboard-data"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("events_count", response.json())
        self.assertIn("revenue", response.json())
