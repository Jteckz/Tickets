from decimal import Decimal
from django.conf import settings
from core.models import Ticket


def create_ticket(*, event, user):
    commission_rate = (
        Decimal(settings.PLATFORM_COMMISSION_PERCENT) / Decimal("100")
    )

    ticket_price = event.price

    # CALCULATIONS
    commission_amount = ticket_price * commission_rate
    provider_amount = ticket_price - commission_amount

    # ⬇⬇⬇ THIS IS WHERE YOU WRITE IT ⬇⬇⬇
    ticket = Ticket.objects.create(
        event=event,
        buyer=user,
        price=ticket_price,
        commission_amount=commission_amount,   # ✅ HERE
        provider_amount=provider_amount,
    )

    return ticket
