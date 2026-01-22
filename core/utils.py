import qrcode
from io import BytesIO
from django.core.files import File
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