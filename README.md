# ABDM Diagnostics Platform (Layer 1)

This repository contains the digital health platform built for small diagnostic labs and clinics in India, enabling integration with the Ayushman Bharat Digital Mission (ABDM).

## Tech Stack
- **Frontend**: React (Vite), TypeScript, React Router
- **Backend**: FastAPI (Python), SQLAlchemy, asyncpg, bcrypt (direct)
- **Database**: PostgreSQL (NeonDB)
- **Containerization**: Docker & Docker Compose

## Features Built So Far
- **Lab Onboarding**: A tablet-first UI that allows labs to register, set their facility details, manage staff, and create an admin login (`/onboarding`).
- **Staff List (Interactive)**: Inline entry for Name, Role, Email, and Contact number in onboarding Step 3.
- **Active Tests Catalogue**: Interactive multi-select grid preloaded directly from NeonDB in onboarding Step 4.
- **Authentication**: Secure JWT-based login using credentials created during onboarding (`/login`).
- **Admin Dashboard**: A secure, token-protected dashboard displaying recent transactions and business overview statistics (`/dashboard`).
- **Patient Registration (Mock)**: A responsive patient registration form (`/patients/register`).

## How to Run

### Prerequisites
- Docker and Docker Compose installed (Ensure Docker Desktop is running on Windows).
- Node.js (for local frontend development if not using Docker).

### Setup and Start
1. Ensure your `.env` file is properly configured. A `.env.example` is provided. If you don't have a `.env` file, copy it:
   ```bash
   cp .env.example .env
   ```
2. Start the application using Docker Compose:
   ```bash
   docker compose up -d --build
   ```
3. The services will be available at:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Backend Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Application Flow
1. Navigate to `http://localhost:5173/onboarding` and complete the form. Enter a username and password. Click "Next" through the steps and finally click **Finish setup**.
2. You will be redirected to the Login page (`http://localhost:5173/login`). Enter the username and password you just created.
3. Upon successful login, you will be redirected to the secure Admin Dashboard (`http://localhost:5173/dashboard`).

---

## Developer Handover Notes (For Harika)

### Background Fetching Optimization
Database loading latency has been optimized by changing how Step 4 tests are loaded. Instead of querying `/api/catalogue/tests` when the user clicks onto Step 4 (which caused a noticeable delay due to serverless cold starts & regional latency), the list is now **fetched immediately on component mount in the background** when `/onboarding` is loaded. By the time the user completes Steps 1-3, the data is instantly available, preventing any screen freeze or missing table states.

### Step 3 Staff Logic
The step 3 staff flow has been updated to request:
- **Name**
- **Email**
- **Contact Number**
- **Role**

The invite-only pending status badge was removed in favor of a clean, immediate list display.

### Database Models & Routing
The database connection utilizes plain `bcrypt` instead of `passlib` to avoid packaging compatibility problems with modern python versions.
New database tables: `patients`, `transactions`, `test_catalogue`, `staff_members`. Refer to [business.py](file:///c:/Users/sriva/Downloads/medbridge/backend/app/models/business.py) for the SQLAlchemy schemas.
