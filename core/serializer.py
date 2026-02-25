from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Event, Invitation, Ticket, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "role",
            "is_active",
            "created_at",
        ]


class EventSerializer(serializers.ModelSerializer):
    sold_tickets = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "date",
            "venue",
            "ticket_price",
            "tickets_available",
            "total_tickets",
            "is_hot",
            "image",
            "provider",
            "sold_tickets",
        ]
        read_only_fields = ["provider", "sold_tickets"]

    def get_sold_tickets(self, obj):
        if obj.total_tickets:
            return max(obj.total_tickets - obj.tickets_available, 0)
        return obj.tickets.count()


class EventCreateUpdateSerializer(EventSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)

        total_tickets = attrs.get("total_tickets", getattr(self.instance, "total_tickets", 0))
        tickets_available = attrs.get("tickets_available")

        if total_tickets is not None and total_tickets < 0:
            raise serializers.ValidationError({"total_tickets": "Total tickets must be 0 or greater."})

        if tickets_available is None:
            attrs["tickets_available"] = total_tickets
        elif tickets_available < 0:
            raise serializers.ValidationError({"tickets_available": "Available tickets must be 0 or greater."})

        if attrs["tickets_available"] > total_tickets:
            raise serializers.ValidationError(
                {"tickets_available": "Available tickets cannot exceed total tickets."}
            )

        return attrs

    class Meta(EventSerializer.Meta):
        read_only_fields = ["provider", "sold_tickets"]


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class TicketSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "event",
            "buyer",
            "qr_code",
            "status",
            "payment_confirmed",
            "is_active",
            "price",
            "commission_amount",
            "provider_amount",
            "created_at",
        ]
        read_only_fields = [
            "event",
            "buyer",
            "qr_code",
            "status",
            "created_at",
            "payment_confirmed",
            "is_active",
            "commission_amount",
            "provider_amount",
        ]


class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = "__all__"
        read_only_fields = ["uuid", "qr_code", "created_at", "creator"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "phone", "password", "role")

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data.get("username"),
            email=validated_data.get("email"),
            phone=validated_data.get("phone"),
            password=validated_data["password"],
            role=validated_data.get("role", "customer"),
        )
