# 📦 StockSense

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=20232a)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)
![Status](https://img.shields.io/badge/status-active-success)

**Centralized Inventory Management System** — real-time tracking of products, warehouses, receipts, deliveries, transfers, and stock adjustments.

🔗 **Live App:** [stocksense-odoo.vercel.app](https://stocksense-odoo.vercel.app)
🏆 **Built for:** Odoo × GCET Hyderabad Hackathon 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Team](#team)

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
```
React Frontend → Express API → Supabase (PostgreSQL)
```

---

## Project Structure

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

## Team

**CodeForIndia** · Karpagam College of Engineering

| Name | Roll No. | Role |
|---|---|---|
| Pranav R K | 71725P139 | Team Leader, Full-stack |
| Cibi K | 71725F112 | Frontend |
| Sriram G S | 71725F152 | Backend |

