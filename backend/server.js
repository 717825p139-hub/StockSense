const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const stockRoutes = require('./routes/stock');
const warehousesRoutes = require('./routes/warehouses');
const locationsRoutes = require('./routes/locations');
const receiptsRoutes = require('./routes/receipts');
const deliveriesRoutes = require('./routes/deliveries');
const transfersRoutes = require('./routes/transfers');
const adjustmentsRoutes = require('./routes/adjustments');
const moveHistoryRoutes = require('./routes/moveHistory');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StockSense API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/warehouses', warehousesRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/deliveries', deliveriesRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/adjustments', adjustmentsRoutes);
app.use('/api/move-history', moveHistoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`StockSense Backend Server listening on port ${PORT}`);
});
