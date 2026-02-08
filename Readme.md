# 2NI Tickets

A comprehensive, full-featured ticket management system designed to facilitate seamless event creation, secure ticket purchasing, and digital invitation management. Built with Django and modern frontend technologies, **2NI Tickets** offers a robust platform for event organizers and attendees alike.

## 🚀 Features

### 🎭 User Roles & Dashboards
The platform supports multiple user roles, each with a dedicated dashboard and specific permissions:
-   **Admin**: Full control over users, events, and system settings.
-   **Staff**: Validate tickets and assist with event management.
-   **Provider**: Create and manage events, track ticket sales, and view revenue.
-   **Customer**: Browse events, purchase tickets, and manage bookings.

### 📅 Event Management
-   **Create & Customize**: Providers can create detailed event listings with descriptions, venues, dates, and ticket prices.
-   **Management**: Edit event details, track available tickets, and manage event status.

### 🎟️ Secure Ticketing System
-   **Purchase**: Seamless ticket purchasing flow for customers.
-   **QR Code Generation**: Every ticket generates a unique QR code for secure validation.
-   **Validation**: Staff can scan and validate tickets at the event venue.

### 📩 Digital Invitations
-   **Custom Invites**: Users can create and send digital invitations for private events.
-   **Tracking**: Track the status of sent invitations (Active/Used).
-   **QR Integration**: Invitations also include QR codes for easy check-in.

### 🌍 Internationalization (i18n)
-   **Multi-Language Support**: Fully localized for **English** and **Swahili**.
-   **Language Switcher**: Easily toggle between languages via the UI.

### 🔒 Security & Performance
-   **Authentication**: Secure JWT-based authentication.
-   **Role-Based Access Control**: Strict permission checks for API endpoints and views.
-   **Scalable Database**: Powered by PostgreSQL for reliable data management.

## 🛠️ Technology Stack

-   **Backend**: Python 3.10+, Django 5.2, Django REST Framework (DRF)
-   **Frontend**: HTML5, TailwindCSS, JavaScript (Vanilla)
-   **Database**: PostgreSQL
-   **Utilities**: `gunicorn`, `whitenoise`, `python-dotenv`

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
-   **Python 3.10** or higher
-   **PostgreSQL** database
-   **Git**

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd ticket-app
    ```

2.  **Set Up a Virtual Environment**
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add the following configurations:
    ```env
    SECRET_KEY=your_secret_key
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1
    DB_NAME=ticketflow_db
    DB_USER=postgres
    DB_PASSWORD=your_password
    DB_HOST=localhost
    DB_PORT=5432
    ```

5.  **Apply Database Migrations**
    ```bash
    python manage.py migrate
    ```

6.  **Create a Superuser**
    ```bash
    python manage.py createsuperuser
    ```

7.  **Run the Development Server**
    ```bash
    python manage.py runserver
    ```

    Access the application at `http://127.0.0.1:8000/`.

## 📖 API Documentation

The project includes a comprehensive REST API. Once the server is running, you can explore the endpoints:

-   **Base API URL**: `/api/`
-   **Authentication**: `/api/token/` (Obtain JWT Pair)
-   **Users**: `/api/users/`, `/api/profile/`
-   **Events**: `/api/events/`
-   **Tickets**: `/api/tickets/`
-   **Invitations**: `/api/invitations/`

## 📄 License

This project is licensed under the MIT License.
