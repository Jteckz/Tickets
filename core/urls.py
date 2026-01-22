from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, profile_view,
    EventViewSet, TicketViewSet, InvitationViewSet,
    book_ticket, verify_ticket, api_root, register_page, provider_dashboard_data

)

# DRF router
router = DefaultRouter()
router.register("events", EventViewSet, basename="events")
router.register("tickets/my", TicketViewSet, basename="my-tickets")
router.register("invitations/my", InvitationViewSet, basename="my-invitations")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("profile/", profile_view, name="profile"),
    path("tickets/book/<int:pk>/", book_ticket, name="book-ticket"),
    path("tickets/verify/", verify_ticket, name="verify-ticket"),

    # Include router URLs
    path("", include(router.urls)),
    path("dashboard/provider/data/", provider_dashboard_data, name="provider-dashboard-data"),
    # API root
    path("api-root/", api_root, name="api-root"),
]
