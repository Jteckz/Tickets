from django.test import TestCase
from django.urls import reverse

class FrontendRoutingTests(TestCase):
    def test_login_page_status_code(self):
        # We expect this to fail initially (returning 404) based on current setup
        response = self.client.get('/login/')
        self.assertEqual(response.status_code, 200)

    def test_index_page_status_code(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
