from rest_framework import serializers
from .models import User, Event, Ticket, Invitation 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'phone',
            'role',
            'is_active',
            'created_at',
        ]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'date',
            'venue',
            'tickets_available',
        ]


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class TicketSerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source='event.title')

    class Meta:
        model = Ticket
        fields = [
            'id',
            'event',
            'event_title',
            'buyer',
            'qr_code',
            'status',
            'created_at',
        ]
        read_only_fields = ['qr_code', 'status', 'created_at']        


class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = "__all__"
        read_only_fields = ["uuid", "qr_code", "created_at"]        


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "phone", "password", "role")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get("username"),
            email=validated_data.get("email"),
            phone=validated_data.get("phone"),
            password=validated_data["password"],
            role=validated_data.get("role", "customer"),
        )
        return user
