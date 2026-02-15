# TicketFlow Backend API

Backend API service for the TicketFlow application, built with Django and Django REST Framework.

## Features

- **RESTful API**: comprehensive endpoints for events, tickets, users, and invitations.
- **Authentication**: JWT-based authentication (simplejwt).
- **Role-Based Access**: Granular permissions for Customers, Providers, Staff, and Admin.
- **Event Management**: Create, update, and manage events.
- **Ticketing System**: Book tickets, generate QR codes, and verify tickets.
- **Provider Dashboard**: Revenue tracking and event analytics.

## Tech Stack

- **Python 3.10+**
- **Django 5.x**
- **Django REST Framework**
- **PostgreSQL** (Production) / **SQLite** (Dev)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ticket-app-backend
    ```

2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    
    # Windows
    .\venv\Scripts\activate
    
    # Linux/Mac
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    - Copy `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        # or on Windows
        copy .env.example .env
        ```
    - Update `.env` with your database credentials and secret key.

5.  **Run Migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Create Superuser:**
    ```bash
    python manage.py createsuperuser
    ```

7.  **Run the Server:**
    ```bash
    python manage.py runserver
    ```

## API Documentation

The API is available at `http://127.0.0.1:8000/api/`.

### Key Endpoints

-   **Auth**:
    -   `POST /api/auth/register/` - Register new user
    -   `POST /api/auth/login/` - Login and get JWT pair
    -   `POST /api/auth/token/refresh/` - Refresh access token

-   **Events**:
    -   `GET /api/events/` - List all events
    -   `POST /api/events/` - Create event (Provider only)
    -   `GET /api/events/{id}/` - Retrieve event details

-   **Tickets**:
    -   `POST /api/tickets/book/{event_id}/` - Book a ticket
    -   `GET /api/tickets/my/` - List my tickets
    -   `POST /api/tickets/verify/` - Verify ticket (Staff only)

## License

[MIT](LICENSE)
