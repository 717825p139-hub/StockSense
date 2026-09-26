# 📦 StockSense

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=20232a)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)
![Status](https://img.shields.io/badge/status-active-success)
![Made for](https://img.shields.io/badge/Made%20for-Odoo%20×%20GCET%20Hackathon%202026-orange)

![Last Commit](https://img.shields.io/github/last-commit/717825p139-hub/StockSense)
![Repo Size](https://img.shields.io/github/repo-size/717825p139-hub/StockSense)
![Top Language](https://img.shields.io/github/languages/top/717825p139-hub/StockSense)

**Centralized Inventory Management System** — real-time tracking of products, warehouses, receipts, deliveries, transfers, and stock adjustments.

🔗 **Live App:** [stocksense-odoo.vercel.app](https://stocksense-odoo.vercel.app)
🏆 **Built for:** Odoo × GCET Hyderabad Hackathon 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Demo Login Credentials](#-demo-login-credentials)
8. [Team](#team)

---

## Overview

StockSense replaces manual registers, spreadsheets, and scattered stock tracking with a single centralized platform. It gives **Inventory Managers** and **Warehouse Staff** real-time visibility into every product, every location, and every stock movement — from vendor receipt to final delivery.

**Core data flow:**

```
Products → Warehouses → Locations → Inventory Operations → Stock → Movement History
```

---

## Features

### Core Operations
- **Receipts** — record incoming stock from vendors
- **Delivery Orders** — pick, pack, and ship outgoing stock
- **Internal Transfers** — move stock between racks, floors, or warehouses
- **Stock Adjustments** — reconcile system stock with physical counts
- **Move History** — complete, timestamped ledger of every stock event

### Catalog & Setup
- **Products** — create/update products, categories, units of measure
- **Reordering Rules** — automated low-stock reorder thresholds
- **Warehouses & Locations** — multi-warehouse, multi-location tracking

### Visibility & Insights
- **Dashboard** — real-time KPIs and operations overview
- **Reports** — inventory summaries and analytics
- **Audit Logs** — user and system activity tracking
- **Notifications** — low-stock and operational alerts
- **Global Search** — quickly find products, orders, and records

### Platform
- **Authentication** — signup, login, forgot/reset password
- **AI Copilot** — AI assistant for inventory queries

---

## Screenshots

| Dashboard | Receipts |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Receipts](docs/screenshots/receipts.png) |

| Delivery Orders | Move History |
|---|---|
| ![Delivery Orders](docs/screenshots/deliveries.png) | ![Move History](docs/screenshots/move-history.png) |

> Add screenshots to `docs/screenshots/` with the filenames above to display them here.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| UI / Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Backend Database Platform | Supabase |
| Authentication | Supabase Auth |
| API | REST APIs |
| Deployment | Vercel |
| Version Control | Git + GitHub |
| Security | Helmet, rate limiting, role-based authorization |
| Data Export | CSV reports |

**Architecture:**

```mermaid
graph LR
    A[React Frontend<br/>Vite + Tailwind] -->|REST API| B[Express Backend<br/>Node.js]
    B -->|Auth| C[Supabase Auth]
    B -->|Queries| D[(Supabase<br/>PostgreSQL)]
    B -->|Hosted on| E[Vercel]
    A -->|Hosted on| E
```

---

## Project Structure

![Frontend](https://img.shields.io/badge/📁-frontend-61DAFB?style=flat-square&labelColor=1e1e1e)
![Backend](https://img.shields.io/badge/📁-backend-339933?style=flat-square&labelColor=1e1e1e)
![API](https://img.shields.io/badge/📁-api-000000?style=flat-square&labelColor=1e1e1e)
![Supabase](https://img.shields.io/badge/📁-supabase-3ECF8E?style=flat-square&labelColor=1e1e1e)

```
StockSense/
├── frontend/              React + Vite client
│   └── src/
│       ├── pages/         Route-level views (Dashboard, Receipts, Deliveries, ...)
│       ├── components/    Shared UI (Navbar, Sidebar, Modals)
│       ├── context/       App-wide state
│       └── services/      API clients
│
├── backend/               Express server
│   ├── routes/            REST endpoints per module
│   ├── middleware/        Auth & security
│   ├── services/          Business logic (stock, security monitoring)
│   ├── config/            DB & Supabase config
│   └── scripts/           DB init, seed, verification
│
├── api/                   Vercel serverless entry point
├── supabase/               Database migrations
└── vercel.json             Deployment config
```

---

## Getting Started

![Node](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-%3E%3D9-CB3837?logo=npm&logoColor=white)
![Supabase Required](https://img.shields.io/badge/Requires-Supabase%20Project-3ECF8E?logo=supabase&logoColor=white)

### Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com) project (Postgres + Auth)

### 1. Clone the repo
```bash
git clone https://github.com/<your-org>/StockSense.git
cd StockSense
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # add your Supabase credentials
npm run init-db        # initialize database schema
npm run seed           # optional: seed sample data
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env   # add your API/Supabase config
npm run dev
```

The frontend runs on Vite's default dev port; the backend serves the REST API consumed by the client.

---

## 🔐 Demo Login Credentials

StockSense provides role-based access for three types of users. The following accounts are available for the hackathon demonstration.

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | `admin@stocksense.demo` | `Admin@12345` |
| 📦 **Inventory Manager** | `manager@stocksense.demo` | `Manager@12345` |
| 🏭 **Warehouse Staff** | `staff@stocksense.demo` | `Staff@12345` |

### 👑 Admin

**Email:** `admin@stocksense.demo`
**Password:** `Admin@12345`

Provides full system access, including:

- Dashboard
- Products
- Stock
- Categories
- Reordering Rules
- Receipts
- Delivery Orders
- Internal Transfers
- Inventory Adjustments
- Move History
- Warehouses & Locations
- Reports
- AI Copilot
- User Management
- Audit Logs
- Security Monitor
- Settings
- Profile

### 📦 Inventory Manager

**Email:** `manager@stocksense.demo`
**Password:** `Manager@12345`

Provides inventory management access, including:

- Dashboard
- Products
- Stock
- Categories
- Reordering Rules
- Receipts
- Delivery Orders
- Internal Transfers
- Inventory Adjustments
- Move History
- Warehouses & Locations
- Reports
- AI Copilot
- Settings
- Profile

Admin-only functions are protected by role-based authorization.

### 🏭 Warehouse Staff

**Email:** `staff@stocksense.demo`
**Password:** `Staff@12345`

Provides warehouse-focused operational access, including:

- Dashboard
- Stock
- Receipts
- Delivery Orders
- Internal Transfers
- Move History
- Reports
- AI Copilot
- Profile

Administrative functions and restricted APIs are protected from Warehouse Staff users.

> **Demo accounts:** These credentials are intended only for the hackathon demonstration environment. Do not use them for a production deployment.

---

## Team

**CodeForIndia** · Karpagam College of Engineering

| Name | Roll No. | Role |
|---|---|---|
| Pranav R K | 71725P139 | ![Team Lead](https://img.shields.io/badge/Team%20Lead-Full--stack-f0a500) |
| Cibi K | 71725F112 | ![Frontend](https://img.shields.io/badge/Role-Frontend-61DAFB?logo=react&logoColor=white) |
| Sriram G S | 71725F152 | ![Backend](https://img.shields.io/badge/Role-Backend-339933?logo=node.js&logoColor=white) |
