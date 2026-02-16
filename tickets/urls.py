"""
URL configuration for tickets project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from core import frontend_views

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    path("", frontend_views.index, name="index"),
    path("login/", frontend_views.login_page, name="login-page"),
    path("register/", frontend_views.register_page, name="register-page"),
    path("dashboard/", frontend_views.dashboard, name="dashboard"),
    path("events/", frontend_views.events, name="events-page"),
    path("tickets/", frontend_views.tickets, name="tickets-page"),
    path("provider-dashboard/", frontend_views.provider_dashboard, name="provider-dashboard-page"),
    path("scanner/", frontend_views.scanner, name="scanner-page"),

    # API routes under /api/
    path("api/", include("core.urls")),
]
# Trigger reload
