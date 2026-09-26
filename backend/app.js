const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const reorderRulesRoutes = require('./routes/reorderRules');
const stockRoutes = require('./routes/stock');
const warehousesRoutes = require('./routes/warehouses');
const locationsRoutes = require('./routes/locations');
const receiptsRoutes = require('./routes/receipts');
const deliveriesRoutes = require('./routes/deliveries');
const transfersRoutes = require('./routes/transfers');
const adjustmentsRoutes = require('./routes/adjustments');
const moveHistoryRoutes = require('./routes/moveHistory');
const dashboardRoutes = require('./routes/dashboard');
const reportsRoutes = require('./routes/reports');
const notificationsRoutes = require('./routes/notifications');
const auditLogsRoutes = require('./routes/auditLogs');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Public Vercel Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'StockSense',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/reorder-rules', reorderRulesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/warehouses', warehousesRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/deliveries', deliveriesRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/adjustments', adjustmentsRoutes);
app.use('/api/move-history', moveHistoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR'
  });
});

module.exports = app;
