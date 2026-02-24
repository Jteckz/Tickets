from io import BytesIO

import qrcode
from django.core.files import File
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


def generate_ticket_pdf(ticket):
    buffer = BytesIO()
    p = canvas.Canvas(buffer)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 750, "EVENT TICKET")

    p.setFont("Helvetica", 12)
    p.drawString(100, 720, f"Ticket ID: {ticket.id}")
    p.drawString(100, 700, f"Event: {ticket.event.title}")
    p.drawString(100, 680, f"Date: {ticket.event.date}")
    p.drawString(100, 660, f"Venue: {ticket.event.venue}")

    p.showPage()
    p.save()

    buffer.seek(0)
    return buffer


def build_ticket_invitation_pdf(ticket, confirmation_id):
    """Create a downloadable invitation-style PDF for a ticket."""
    buffer = BytesIO()
    qr_payload = f"confirmation:{confirmation_id}"

    qr_image = qrcode.make(qr_payload)
    qr_buffer = BytesIO()
    qr_image.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)

    pdf = canvas.Canvas(buffer)
    pdf.setTitle(f"Ticket Invitation {ticket.id}")

    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(60, 790, "TicketFlow Invitation")

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(60, 748, "Event")
    pdf.setFont("Helvetica", 13)
    pdf.drawString(60, 728, ticket.event.title)

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(60, 690, "Description")
    pdf.setFont("Helvetica", 12)
    description = ticket.event.description or "No description provided."
    text = pdf.beginText(60, 670)
    text.setLeading(16)
    for line in description.splitlines() or [description]:
        text.textLine(line)
    pdf.drawText(text)

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(60, 110, f"Confirmation ID: {confirmation_id}")
    pdf.drawImage(ImageReader(qr_buffer), 430, 55, width=120, height=120, preserveAspectRatio=True, mask="auto")

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer
