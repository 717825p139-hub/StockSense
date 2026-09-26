import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AiAssistantModal from './components/AiAssistantModal';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ReceiptsList from './pages/ReceiptsList';
import ReceiptDetail from './pages/ReceiptDetail';
import ReceiptForm from './pages/ReceiptForm';
import DeliveriesList from './pages/DeliveriesList';
import DeliveryDetail from './pages/DeliveryDetail';
import DeliveryForm from './pages/DeliveryForm';
import TransfersList from './pages/TransfersList';
import TransferDetail from './pages/TransferDetail';
import TransferForm from './pages/TransferForm';
import AdjustmentsList from './pages/AdjustmentsList';
import AdjustmentForm from './pages/AdjustmentForm';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import StockList from './pages/StockList';
import WarehousesList from './pages/WarehousesList';
import LocationsList from './pages/LocationsList';
import MoveHistory from './pages/MoveHistory';
import Settings from './pages/Settings';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const [aiOpen, setAiOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading StockSense...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenAi={() => setAiOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/receipts" element={<ReceiptsList />} />
          <Route path="/receipts/new" element={<ReceiptForm />} />
          <Route path="/receipts/:id" element={<ReceiptDetail />} />
          <Route path="/deliveries" element={<DeliveriesList />} />
          <Route path="/deliveries/new" element={<DeliveryForm />} />
          <Route path="/deliveries/:id" element={<DeliveryDetail />} />
          <Route path="/transfers" element={<TransfersList />} />
          <Route path="/transfers/new" element={<TransferForm />} />
          <Route path="/transfers/:id" element={<TransferDetail />} />
          <Route path="/adjustments" element={<AdjustmentsList />} />
          <Route path="/adjustments/new" element={<AdjustmentForm />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/stock" element={<StockList />} />
          <Route path="/warehouses" element={<WarehousesList />} />
          <Route path="/locations" element={<LocationsList />} />
          <Route path="/move-history" element={<MoveHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <AiAssistantModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
