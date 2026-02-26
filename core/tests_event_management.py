import tempfile
from pathlib import Path

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import Event, User


TEST_GIF = (
    b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01"
    b"\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
)


class EventImageAndDeletionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.provider = User.objects.create_user(username="provider", password="pass1234", role="provider")
        self.other_provider = User.objects.create_user(username="provider2", password="pass1234", role="provider")

    def _uploaded_image(self, name="event.gif"):
        return SimpleUploadedFile(name, TEST_GIF, content_type="image/gif")

    @override_settings(MEDIA_ROOT=tempfile.mkdtemp())
    def test_provider_can_upload_and_clear_event_image(self):
        self.client.force_authenticate(self.provider)

        create_response = self.client.post(
            reverse("events-list"),
            {
                "title": "Image Event",
                "description": "With image",
                "venue": "Hall",
                "date": "2026-12-31T20:00:00Z",
                "ticket_price": "100.00",
                "total_tickets": 50,
                "tickets_available": 50,
                "image": self._uploaded_image(),
            },
            format="multipart",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        event = Event.objects.get(id=create_response.data["id"])
        self.assertTrue(event.image.name)
        image_path = Path(event.image.path)
        self.assertTrue(image_path.exists())

        clear_response = self.client.patch(
            reverse("events-detail", kwargs={"pk": event.id}),
            {"clear_image": True},
            format="multipart",
        )
        self.assertEqual(clear_response.status_code, status.HTTP_200_OK)
        event.refresh_from_db()
        self.assertFalse(event.image)
        self.assertFalse(image_path.exists())

    @override_settings(MEDIA_ROOT=tempfile.mkdtemp())
    def test_deleting_event_removes_image_file(self):
        event = Event.objects.create(
            title="Delete Event",
            venue="Arena",
            date="2026-01-01T20:00:00Z",
            ticket_price="75.00",
            total_tickets=20,
            tickets_available=20,
            provider=self.provider,
            image=self._uploaded_image("delete.gif"),
        )
        image_path = Path(event.image.path)
        self.assertTrue(image_path.exists())

        self.client.force_authenticate(self.provider)
        response = self.client.delete(reverse("events-detail", kwargs={"pk": event.id}))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(image_path.exists())

    def test_provider_cannot_delete_another_providers_event(self):
        event = Event.objects.create(
            title="Other Event",
            venue="Arena",
            date="2026-01-01T20:00:00Z",
            ticket_price="75.00",
            total_tickets=20,
            tickets_available=20,
            provider=self.other_provider,
        )

        self.client.force_authenticate(self.provider)
        response = self.client.delete(reverse("events-detail", kwargs={"pk": event.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
