# LocalCart: Production-Ready Local E-Commerce Platform

A production-grade, highly responsive, mobile-first local e-commerce application. It includes a FastAPI python backend, a React.js (Vite) frontend, Zustand state management, and is built to integrate with Supabase PostgreSQL and Auth.

---

## Technical Stack

* **Frontend**: React.js, Vite, Zustand (persisted state), Tailwind CSS, Axios, Lucide-React, React-Hot-Toast
* **Backend**: FastAPI (Python), SQLAlchemy 2.0 ORM, Pydantic v2 (serialization), Python-Jose (JWT validation)
* **Database**: Supabase PostgreSQL (or local SQLite auto-fallback)
* **Authentication**: Supabase Auth (JWT role verification)

---

## Directory Structure

```text
local e commerce/
├── backend/                  # FastAPI Backend Source
│   ├── database/             # Connection configurations
│   ├── middleware/           # Supabase JWT authentication & RBAC
│   ├── models/               # SQLAlchemy models
│   ├── routers/              # API Endpoints (Products, Orders, Profiles, Admin)
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Transactional checkout and inventory control
│   ├── main.py               # Application bootstrap
│   └── requirements.txt      # Python packages
├── frontend/                 # React Frontend Source
│   ├── src/
│   │   ├── components/       # Sticky Navbar, Footer, Protected Route, Skeletons
│   │   ├── pages/            # Landing, Product Details, Cart, Admin Dashboard, Profile
│   │   ├── services/         # Axios API Client & Supabase initializer
│   │   ├── store/            # Zustand state stores
│   │   ├── App.jsx           # Routes definitions
│   │   ├── index.css         # Tailwind & custom scrollbar styles
│   │   └── main.jsx          # Bootstrapper
│   ├── tailwind.config.js    # Tailwind specifications
│   └── package.json          # Node dependencies
└── schema.sql                # PostgreSQL Database Schema
```

---

## Database Setup

1. Log into your [Supabase Dashboard](https://supabase.com/).
2. Select your project and navigate to the **SQL Editor**.
3. Open the [schema.sql](file:///c:/Users/harih/Downloads/local%20e%20commerce/schema.sql) file.
4. Copy its contents, paste them into the SQL Editor, and click **Run**.
5. *(Optional)* If you wish to automatically create a profile record when a user registers on Supabase Auth, uncomment the Postgres trigger section at the bottom of the SQL script and run it.

---

## Setup & Running Locally

### 1. Backend Setup

The backend has an **automatic SQLite fallback** if no database configuration is provided, allowing you to test it instantly without setting up PostgreSQL.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
   *Modify the database credentials and `SUPABASE_JWT_SECRET` in `.env` if using Supabase.*
5. Run the FastAPI development server:
   ```bash
   python main.py
   # Or using uvicorn:
   uvicorn backend.main:app --reload
   ```
   *The server runs by default on [http://localhost:8000](http://localhost:8000).*

### 2. Frontend Setup

The frontend has a **Mock Auth mode** that auto-toggles if no Supabase environment variables are provided. This enables instant offline testing with pre-built credentials.

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the node modules:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
   *Configure your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if using live Supabase Auth.*
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Access the web app at [http://localhost:5173](http://localhost:5173).*

---

## Mock Mode Credentials

If you run without setting up live Supabase keys, you can sign in immediately using:
* **Customer role**: `customer@localcart.com` / *(any password)*
* **Admin role**: `admin@localcart.com` / *(any password)*
