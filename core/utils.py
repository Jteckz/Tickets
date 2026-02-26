from io import BytesIO

import qrcode
from django.core.files import File
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


def generate_ticket_qr(ticket):
    url = f"http://127.0.0.1:8000/api/tickets/{ticket.id}/"

    qr = qrcode.make(url)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")

    ticket.qr_code.save(
        f"ticket_{ticket.uuid}.png",
        File(buffer),
        save=False
    )


def generate_invitation_qr(invitation):
    url = f"http://127.0.0.1:8000/invitations/download/{invitation.uuid}/"

    qr = qrcode.make(url)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")

    invitation.qr_code.save(
        f"invitation_{invitation.uuid}.png",
        File(buffer),
        save=False
    )


def _draw_wrapped_text(pdf, text, x, y, max_width, line_height=14, font_name="Helvetica", font_size=11):
    pdf.setFont(font_name, font_size)
    lines = []
    for paragraph in text.splitlines() or [text]:
        words = paragraph.split()
        if not words:
            lines.append("")
            continue

        current = words[0]
        for word in words[1:]:
            candidate = f"{current} {word}"
            if pdf.stringWidth(candidate, font_name, font_size) <= max_width:
                current = candidate
            else:
                lines.append(current)
                current = word
        lines.append(current)

    cursor = y
    for line in lines:
        pdf.drawString(x, cursor, line)
        cursor -= line_height

    return cursor


def generate_ticket_pdf(ticket):
    confirmation_id = f"TKT-{ticket.id:06d}-{ticket.created_at.strftime('%Y%m%d')}"
    return build_ticket_invitation_pdf(ticket, confirmation_id)


def build_ticket_invitation_pdf(ticket, confirmation_id):
    """Create a downloadable invitation-style PDF for a ticket."""
    buffer = BytesIO()
    verification_payload = f"ticket:{ticket.id}"

    qr_image = qrcode.make(verification_payload)
    qr_buffer = BytesIO()
    qr_image.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)

    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    pdf.setTitle(f"Ticket Invitation {ticket.id}")

    # dark themed background panel
    pdf.setFillColor(colors.HexColor("#0f172a"))
    pdf.rect(0, 0, width, height, stroke=0, fill=1)

    # glass card
    card_x, card_y = 40, 50
    card_w, card_h = width - 80, height - 100
    pdf.setFillColor(colors.HexColor("#1e293b"))
    pdf.roundRect(card_x, card_y, card_w, card_h, 18, stroke=0, fill=1)

    pdf.setStrokeColor(colors.HexColor("#38bdf8"))
    pdf.setLineWidth(1.2)
    pdf.roundRect(card_x, card_y, card_w, card_h, 18, stroke=1, fill=0)

    pdf.setFillColor(colors.HexColor("#e2e8f0"))
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawString(card_x + 28, height - 110, "TicketFlow Invitation")

    pdf.setFillColor(colors.HexColor("#bae6fd"))
    pdf.setFont("Helvetica", 12)
    pdf.drawString(card_x + 28, height - 135, "Welcome to the event! We're excited to have you.")

    # event metadata
    top = height - 180
    pdf.setFillColor(colors.HexColor("#f8fafc"))
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(card_x + 28, top, "Event")
    pdf.setFont("Helvetica", 13)
    pdf.drawString(card_x + 28, top - 20, ticket.event.title)

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(card_x + 28, top - 50, "Venue")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(card_x + 28, top - 68, ticket.event.venue or "TBA")

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(card_x + 28, top - 95, "Date")
    pdf.setFont("Helvetica", 11)
    event_date = ticket.event.date.strftime("%A, %d %B %Y at %I:%M %p") if ticket.event.date else "TBA"
    pdf.drawString(card_x + 28, top - 113, event_date)

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(card_x + 28, top - 145, "Message")
    description = (ticket.event.description or "Get ready for an amazing event experience with TicketFlow.").strip()
    _draw_wrapped_text(pdf, description, card_x + 28, top - 163, 320, line_height=15, font_name="Helvetica", font_size=11)

    # right-side qr and identifiers
    qr_x = width - 220
    qr_y = card_y + 130
    pdf.setFillColor(colors.HexColor("#f8fafc"))
    pdf.roundRect(qr_x - 10, qr_y - 10, 160, 160, 12, stroke=0, fill=1)
    pdf.drawImage(ImageReader(qr_buffer), qr_x, qr_y, width=140, height=140, preserveAspectRatio=True, mask="auto")

    pdf.setFillColor(colors.HexColor("#cbd5e1"))
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(qr_x - 10, qr_y - 28, f"Confirmation: {confirmation_id}")
    pdf.setFont("Helvetica", 10)
    pdf.drawString(qr_x - 10, qr_y - 44, "QR encodes: ticket:<ticket_id>")
    pdf.drawString(qr_x - 10, qr_y - 58, f"ticket:{ticket.id}")

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer
