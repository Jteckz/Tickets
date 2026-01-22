from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import generics, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import FileResponse
from django.core.files.base import ContentFile
from django.shortcuts import render
import qrcode
from io import BytesIO
from django.contrib.auth.decorators import login_required

from .models import User, Event, Ticket, Invitation
from .serializer import (
    UserSerializer, EventSerializer, TicketSerializer, InvitationSerializer,
    RegisterSerializer, LoginSerializer,
)
from .permissions import IsProvider, IsStaff, IsAdmin

# ---------------- AUTH ----------------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "role": request.user.role,
    })

# ---------------- EVENTS ----------------
class EventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.all().order_by("-date")
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

# ---------------- TICKETS ----------------
class TicketViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(buyer=self.request.user)

# Reserve Ticket (Before Payment)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def book_ticket(request, pk):
    event = get_object_or_404(Event, pk=pk)
    if event.tickets_available <= 0:
        return Response({"error": "No tickets available"}, status=400)

    ticket = Ticket.objects.create(
        event=event,
        buyer=request.user,
        price=event.ticket_price,
        payment_confirmed=False,
        is_active=False
    )
    event.tickets_available -= 1
    event.save()

    return Response({
        "message": "Ticket reserved. Please complete payment.",
        "ticket_id": ticket.id,
        "price": ticket.price
    }, status=201)

# Confirm Payment & Generate QR
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    ticket_id = request.data.get("ticket_id")
    payment_status = request.data.get("payment_status")  # 'success' or 'failed'

    ticket = get_object_or_404(Ticket, id=ticket_id, buyer=request.user)

    if payment_status != "success":
        return Response({"error": "Payment failed"}, status=400)

    ticket.payment_confirmed = True
    ticket.is_active = True

    # Generate QR code
    qr = qrcode.make(f"ticket:{ticket.id}")
    buffer = BytesIO()
    qr.save(buffer)
    ticket.qr_code.save(f"ticket_{ticket.id}.png", ContentFile(buffer.getvalue()), save=True)
    ticket.save()

    return Response({"message": "Payment confirmed, QR code generated!", "qr_code": ticket.qr_code.url})

# Download Ticket
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_ticket(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id, buyer=request.user, is_active=True)

    if not ticket.qr_code:
        return Response({"error": "QR code not available"}, status=400)

    path = ticket.qr_code.path
    return FileResponse(open(path, 'rb'), as_attachment=True, filename=f"{ticket.event.title}_ticket.png")

# Verify Ticket (Staff)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_ticket(request):
    ticket_id = request.data.get("ticket_id")
    if not ticket_id:
        return Response({"error": "ticket_id is required"}, status=400)
    ticket = get_object_or_404(Ticket, id=ticket_id)
    if ticket.status == "used":
        return Response({"error": "Ticket already used"}, status=400)
    ticket.status = "used"
    ticket.save()
    return Response({
        "message": "Ticket verified",
        "ticket_id": str(ticket.id),
        "event": ticket.event.title,
    })

# ---------------- INVITATIONS ----------------
class InvitationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Invitation.objects.filter(creator=self.request.user)

# ---------------- DASHBOARDS ----------------
@api_view(["GET"])
@permission_classes([IsProvider])
def provider_dashboard(request):
    events = Event.objects.filter(provider=request.user)
    tickets = Ticket.objects.filter(event__in=events)
    context = {
        "total_events": events.count(),
        "tickets_issued": tickets.count(),
        "tickets_used": tickets.filter(status="used").count(),
    }
    return render(request, "provider_dashboard.html", context)

@api_view(["GET"])
@permission_classes([IsStaff])
def staff_dashboard(request):
    tickets = Ticket.objects.all()
    context = {
        "total_tickets": tickets.count(),
        "used": tickets.filter(status="used").count(),
        "unused": tickets.filter(status="unused").count(),
    }
    return render(request, "staff_dashboard.html", context)

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    context = {
        "users": User.objects.count(),
        "events": Event.objects.count(),
        "tickets": Ticket.objects.count(),
    }
    return render(request, "dashboard.html", context)

def provider_dashboard_data(request):
    user = request.user

    # Get all events for this provider
    events = Event.objects.filter(provider=user).order_by('-date')
    
    # Tickets issued and used
    tickets = Ticket.objects.filter(event__in=events)
    tickets_issued = tickets.count()
    tickets_used = tickets.filter(status="used").count()

    # Prepare events list for frontend
    events_list = []
    for ev in events:
        events_list.append({
            "id": ev.id,
            "title": ev.title,
            "description": ev.description,
            "date": ev.date.isoformat() if ev.date else "",
            "venue": ev.venue,
            "ticket_price": float(ev.ticket_price),
            "tickets_available": ev.tickets_available,
            "total_tickets": ev.total_tickets,
            "is_hot": ev.is_hot,
        })

    return JsonResponse({
        "total_events": events.count(),
        "tickets_issued": tickets_issued,
        "tickets_used": tickets_used,
        "events": events_list,
    })    

# ---------------- API ROOT ----------------
@api_view(["GET"])
def api_root(request):
    return Response({
        "status": "TicketFlow API running",
        "auth": "/api/auth/",
        "events": "/api/events/",
    })


def index_page(request):
    return render(request, "index.html")


def login_page(request):
    return render(request, "login.html")


def register_page(request):
    return render(request, "register.html")


def customer_dashboard(request):
    return render(request, "dashboard.html")


def provider_dashboard(request):
    return render(request, "provider_dashboard.html")


def staff_dashboard(request):
    return render(request, "staff_dashboard.html")


def admin_dashboard(request):
    return render(request, "admin-dashboard.html")


def events_page(request):
    return render(request, "events.html")


def event_detail_page(request, event_id):
    return render(request, "event-details.html", {"event_id": event_id})


def my_tickets_page(request):
    return render(request, "my-tickets.html")


def ticket_detail_page(request, ticket_id):
    return render(request, "ticket-detail.html", {"ticket_id": ticket_id})


def profile_page(request):
    return render(request, "profile.html")


def provider_events_page(request):
    return render(request, "provider/manage_events.html")


@login_required
def staff_scanner_page(request):
    return render(request, "staff/scanner.html")