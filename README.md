# StockSense 📦

## Smart Inventory Management System

StockSense is a centralized Inventory Management System designed to simplify and digitize warehouse and stock operations.

It replaces manual registers, spreadsheets, and scattered stock tracking with a structured platform for managing **products, warehouses, locations, receipts, deliveries, internal transfers, inventory adjustments, and stock movement history**.

The system is designed for **Inventory Managers and Warehouse Staff**, providing real-time visibility into inventory operations through a simple and professional interface.

🔗 **Live App:** [stocksense-odoo.vercel.app](https://stocksense-odoo.vercel.app)

> ⚠️ **Work in progress:** This README is a rough draft, not final. Project
> structure, folder layout, and file organization are still evolving and
> subject to change as development continues.

---

## 🏆 Hackathon

**Odoo × GCET Hyderabad Hackathon 2026**

### Team

**CodeForIndia**

### College

Karpagam College of Engineering

### Team Members

| Name | Roll No. | Role |
|---|---|---|
| Pranav R K | 71725P139 | Team Leader, Full-stack |
| Cibi K | 71725F112 | Backend |
| Sriram G S | 71725F152 | Frontend |

---

# 🎯 Problem

Traditional inventory management often depends on:

- Manual registers
- Excel spreadsheets
- Separate warehouse records
- Manual stock calculations
- Difficult tracking of stock movements
- Delayed identification of low-stock items

These approaches can lead to inaccurate stock information, difficulty tracing inventory movements, and inefficient warehouse operations.

---

# 💡 Solution

StockSense provides a centralized system where inventory operations can be managed from a single platform.

The system connects:

```text
Products
    ↓
Warehouses
    ↓
Locations
    ↓
Inventory Operations
    ↓
Stock
    ↓
Movement History
```

---

# ⚙️ Features

- **Authentication** – signup, login, forgot/reset password
- **Dashboard** – real-time KPIs and operations snapshot
- **Product Management** – products, categories, reordering rules
- **Warehouses & Locations** – multi-warehouse, multi-location stock
- **Receipts** – record incoming stock from vendors
- **Delivery Orders** – pick, pack, and ship outgoing stock
- **Internal Transfers** – move stock between locations
- **Stock Adjustments** – reconcile system stock with physical counts
- **Move History** – full ledger of every stock movement
- **Reports** – inventory summaries and insights
- **Audit Logs & Security Monitoring** – track user/system activity
- **Notifications** – low-stock and operational alerts
- **Global Search** – quickly find products, orders, and records
- **AI Copilot** – AI assistant for inventory queries and help

---

# 🛠️ Tech Stack

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
| Security | Helmet, Rate Limiting, Authentication & Role-Based Authorization |
| AI Feature | AI Copilot |
| Data Export | CSV Reports |
| Architecture | React Frontend → Express API → Supabase PostgreSQL |

---

# 📁 Project Structure

```text
StockSense/
├── frontend/     → React + Vite client (pages, components, context)
├── backend/      → Express server (routes, services, middleware)
└── supabase/     → Database migrations
```

> Note: layout above reflects the current codebase but is still evolving.
