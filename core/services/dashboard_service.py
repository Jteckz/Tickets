from django.db.models import Sum
from core.models import Ticket


def total_platform_commission():
    return (
        Ticket.objects.aggregate(
            total=Sum("commission_amount")
        )["total"]
        or 0
    )


def provider_earnings(provider):
    return (
        Ticket.objects.filter(event__provider=provider)
        .aggregate(total=Sum("provider_amount"))["total"]
        or 0
    )
