# 📖 LibSpace — Smart Library Reservation System

> **Course:** Web Programming & Applications
> **Topic:** #10 — Containerization & Orchestration (Docker)
> **Semester:** 2 — Academic Year 2025–2026
> 
---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Test Credentials](#test-credentials)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Stopping the System](#stopping-the-system)
- [Team Members](#team-members)

---

## Project Overview

LibSpace is a multi-tier library reservation web application that allows students to:

- Book **group study rooms** (floors 1 & 2) with time-slot conflict detection
- Reserve **overnight study seats** (floor 3, 22:00–06:00)
- View **booking history** and cancel reservations
- Switch between **Vietnamese and English** interface

The system is fully containerized using Docker and orchestrated with Docker Compose, fulfilling Topic 10 requirements.

---

## System Architecture

```
User Browser
     │
     ├─── GET index.html ──────────► Tier 1: Frontend  (nginx:alpine)      :8080
     │
     ├─── POST /api/login ─────────► Tier 2: Backend   (node:18-alpine)    :5000
     │    POST /api/bookings              │
     │                                   ├──► Tier 3: Cache    (redis:7-alpine)      :6379
     │                                   └──► Tier 4: Database (postgres:15-alpine)  :5432
```

All 4 tiers run inside an isolated Docker Compose bridge network with DNS-based service discovery.

---

## Prerequisites

Only **Docker Desktop** is required. No Node.js, PostgreSQL, or Redis installation needed on the host machine.

| Tool | Version | Download |
|------|---------|----------|
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop |

---

## Quick Start

**1. Clone the repository**

```bash
git clone https://github.com/ThaoNghi79/libspace-project.git
cd libspace-project
```

**2. Start all services with a single command**

```bash
docker-compose up --build
```

**3. Open the application**

```
http://localhost:8080
```

That's it. Docker Compose will automatically:
- Build the frontend (Nginx) and backend (Node.js) images
- Pull the official PostgreSQL and Redis images
- Create the database and table schema
- Start all 4 containers in the correct dependency order

> **First run** may take 1–2 minutes to pull images. Subsequent runs start in seconds.

---

## Environment Variables

The following environment variables are pre-configured in `docker-compose.yml` and injected into the backend container at runtime. No `.env` file is needed.

| Variable | Value | Description |
|----------|-------|-------------|
| `DB_HOST` | `db` | PostgreSQL container hostname (internal DNS) |
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `123456` | PostgreSQL password |
| `DB_NAME` | `libspace` | PostgreSQL database name |
| `REDIS_HOST` | `cache` | Redis container hostname (internal DNS) |

---

## Test Credentials

Use the following accounts to log in and test the system:

| Program | Email | Password |
|---------|-------|----------|
| Standard (Hệ tiêu chuẩn) | `tc@student.tdtu.edu.vn` | `student1@tc` |
| CLC (Hệ chất lượng cao) | `clc@student.tdtu.edu.vn` | `student2@clc` |

> **Note:** CLC students receive an automatic **20% discount** on booking fees (20,000 → 16,000 VNĐ).

---

## Project Structure

```
libspace-project/
├── frontend/
│   ├── Dockerfile          # nginx:alpine — serves static assets
│   └── index.html          # Single-Page Application (View layer)
├── backend/
│   ├── Dockerfile          # node:18-alpine — REST API server
│   ├── package.json        # Dependencies: express, pg, redis, cors
│   └── server.js           # Express.js Controller + DB/Redis logic
├── docker-compose.yml      # Orchestrates all 4 services
└── README.md
```

---

## API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/login` | Authenticate student, create Redis session | No |
| `POST` | `/api/bookings` | Save a new booking to PostgreSQL | No |

---

### POST /api/login

**Request Body:**
```json
{
  "email": "clc@student.tdtu.edu.vn",
  "password": "student2@clc"
}
```

**Success Response (200):**
```json
{
  "name": "Nguyễn Lan Anh",
  "email": "clc@student.tdtu.edu.vn",
  "programType": "clc"
}
```

**Error Response (401):** `Unauthorized`

---

### POST /api/bookings

**Request Body:**
```json
{
  "id": 1747123456789,
  "type": "room",
  "studentName": "Nguyễn Lan Anh",
  "email": "clc@student.tdtu.edu.vn",
  "resource": "P. Họp 1 - Tầng 1",
  "resourceId": "R1",
  "dateValue": "2026-05-15",
  "start": "09:00",
  "end": "11:00",
  "status": "Confirmed"
}
```

**Success Response (201):**
```json
{
  "message": "Booking saved to PostgreSQL successfully",
  "data": { ...bookingRecord }
}
```

**Error Responses:**
- `409 Conflict` — time slot already booked
- `500 Internal Server Error`

---

## Stopping the System

**Stop containers (data is preserved):**
```bash
docker-compose stop
```

**Stop and remove containers (data is preserved — pgdata volume persists):**
```bash
docker-compose down
```

**Stop, remove containers AND delete all data:**
```bash
docker-compose down -v
```

---

## Team Members

| Name | Student ID |
|------|-----------|
| Liêu Thảo Nghi | 524H0019 |
| Nguyễn Thị Như Quỳnh | 524H0027 |

---

*LibSpace — Ton Duc Thang University Library Reservation System*
