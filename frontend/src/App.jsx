import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Navigation Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import GlobalSearchModal from './components/GlobalSearchModal';
import NotificationsModal from './components/NotificationsModal';
import AiAssistantModal from './components/AiAssistantModal';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import StockList from './pages/StockList';
import CategoriesList from './pages/CategoriesList';
import ReorderingRules from './pages/ReorderingRules';
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
import MoveHistory from './pages/MoveHistory';
import WarehousesList from './pages/WarehousesList';
import LocationsList from './pages/LocationsList';
import Reports from './pages/Reports';
import AiCopilot from './pages/AiCopilot';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        Loading StockSense Platform...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-1 pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/stock" element={<StockList />} />
            <Route path="/categories" element={<CategoriesList />} />
            <Route path="/reordering" element={<ReorderingRules />} />
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
            <Route path="/move-history" element={<MoveHistory />} />
            <Route path="/warehouses" element={<WarehousesList />} />
            <Route path="/locations" element={<LocationsList />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/copilot" element={<AiCopilot />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Modals & Drawers */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationsModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
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
