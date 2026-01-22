from django.urls import path
from . import views

urlpatterns = [
    # Public
    path("", views.index_page, name="index"),
    path("login/", views.login_page, name="login_page"),
    path("register/", views.register_page, name="register_page"),
    path("events/", views.events_page, name="events"),
    path("events/<int:event_id>/", views.event_detail_page, name="event_detail"),

    # User
    path("dashboard/", views.customer_dashboard, name="customer_dashboard"),
    path("tickets/", views.my_tickets_page, name="my_tickets"),
    path("tickets/<int:ticket_id>/", views.ticket_detail_page, name="ticket_detail"),
    path("profile/", views.profile_page, name="profile"),

    # Provider
    path("provider/dashboard/", views.provider_dashboard, name="provider_dashboard"),
    path("provider/events/", views.provider_events_page, name="provider_events"),

    # Staff
    path("staff/dashboard/", views.staff_dashboard, name="staff_dashboard"),
    path("staff/scanner/", views.staff_scanner_page, name="staff_scanner"),

    # Admin
    path("admin/dashboard/", views.admin_dashboard, name="admin_dashboard"),
]
