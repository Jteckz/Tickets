from django.shortcuts import render


def index(request):
    return render(request, 'index.html')


def login_page(request):
    return render(request, 'login.html')


def register_page(request):
    return render(request, 'register.html')


def dashboard(request):
    return render(request, 'dashboard.html')


def events(request):
    return render(request, 'events.html')


def tickets(request):
    return render(request, 'tickets.html')


def provider_dashboard(request):
    return render(request, 'provider-dashboard.html')


def scanner(request):
    return render(request, 'scanner.html')
