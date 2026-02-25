from io import BytesIO

import qrcode
from django.contrib.auth.decorators import login_required
from django.core.files.base import ContentFile
from django.http import FileResponse, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Event, Invitation, Ticket
from .permissions import IsProvider, IsStaff
from .serializer import (
    EventCreateUpdateSerializer,
    EventSerializer,
    InvitationSerializer,
    LoginSerializer,
    RegisterSerializer,
    TicketSerializer,
)
from .utils import generate_ticket_pdf


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer 
    permission_classes = [AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    if request.method == "PATCH":
        user.phone = request.data.get("phone", user.phone)
        user.email = request.data.get("email", user.email)
        user.save(update_fields=["phone", "email"])

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
        }
    )


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related("provider").all().order_by("-date")

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsProvider()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return EventCreateUpdateSerializer
        return EventSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        mine = self.request.query_params.get("mine")
        if mine in {"1", "true", "True"} and self.request.user.is_authenticated:
            return queryset.filter(provider=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.provider != self.request.user:
            raise PermissionDenied("You can only update your own events.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.provider != self.request.user:
            raise PermissionDenied("You can only delete your own events.")
        instance.delete()



class TicketViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.select_related("event").filter(buyer=self.request.user)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def book_ticket(request, pk):
    event = get_object_or_404(Event, pk=pk)
    if event.tickets_available <= 0:
        return Response({"error": "No tickets available"}, status=status.HTTP_400_BAD_REQUEST)

    ticket = Ticket.objects.create(
        event=event,
        buyer=request.user,
        price=event.ticket_price,
        payment_confirmed=True,
        is_active=True,
    )

    qr = qrcode.make(f"ticket:{ticket.id}")
    buffer = BytesIO()
    qr.save(buffer)
    ticket.qr_code.save(f"ticket_{ticket.id}.png", ContentFile(buffer.getvalue()), save=False)
    ticket.save(update_fields=["qr_code", "payment_confirmed", "is_active"])

    event.tickets_available -= 1
    event.save(update_fields=["tickets_available"])

    return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_ticket(request, ticket_id):
    try:
        ticket = Ticket.objects.select_related("event", "buyer").get(id=ticket_id, is_active=True)
    except Ticket.DoesNotExist:
        return Response({"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

    if ticket.buyer_id != request.user.id:
        return Response({"error": "You are not authorized to download this ticket."}, status=status.HTTP_403_FORBIDDEN)

    pdf_buffer = generate_ticket_pdf(ticket)

    safe_event_name = "".join(ch if ch.isalnum() or ch in {"-", "_"} else "_" for ch in ticket.event.title).strip("_")
    filename = f"{safe_event_name or 'event'}_ticket_{ticket.id}.pdf"

    return FileResponse(
        pdf_buffer,
        as_attachment=True,
        filename=filename,
        content_type="application/pdf",
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsStaff])
def verify_ticket(request):
    ticket_id = request.data.get("ticket_id")
    if not ticket_id:
        return Response({"error": "ticket_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    ticket = get_object_or_404(Ticket, id=ticket_id)
    if ticket.status == "used":
        return Response({"error": "Ticket already used"}, status=status.HTTP_400_BAD_REQUEST)
    if ticket.status == "cancelled":
        return Response({"error": "Ticket is cancelled"}, status=status.HTTP_400_BAD_REQUEST)

    ticket.status = "used"
    ticket.save(update_fields=["status"])

    return Response(
        {
            "message": "Ticket verified",
            "ticket_id": str(ticket.id),
            "event": ticket.event.title,
        }
    )


class InvitationViewSet(viewsets.ModelViewSet):
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Invitation.objects.filter(creator=self.request.user)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsProvider])
def provider_dashboard_data(request):
    events = Event.objects.filter(provider=request.user).order_by("-date")
    tickets = Ticket.objects.filter(event__in=events)
    revenue = sum(t.provider_amount for t in tickets)

    events_list = [
        {
            "id": ev.id,
            "title": ev.title,
            "description": ev.description,
            "date": ev.date.isoformat() if ev.date else "",
            "venue": ev.venue,
            "ticket_price": float(ev.ticket_price),
            "tickets_available": ev.tickets_available,
            "total_tickets": ev.total_tickets,
            "is_hot": ev.is_hot,
            "image": ev.image.url if ev.image else "",
        }
        for ev in events
    ]

    return JsonResponse(
        {
            "events_count": events.count(),
            "tickets_sold": tickets.count(),
            "tickets_used": tickets.filter(status="used").count(),
            "revenue": float(revenue),
            "events": events_list,
        }
    )


@api_view(["GET"])
def api_root(request):
    return Response(
        {
            "status": "2NI Tickets API running",
            "auth": "/api/auth/",
            "events": "/api/events/",
            "tickets": "/api/tickets/",
        }
    )

