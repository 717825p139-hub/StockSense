import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Truck, Plus, Trash2, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function DeliveryForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { product_id: '', quantity: 1 }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/deliveries/customers').then(res => setCustomers(res.data)).catch(console.error);
    api.get('/products').then(res => setProducts(res.data)).catch(console.error);
  }, []);

  const handleAddItem = () => {
    setItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validItems = items.filter(i => i.product_id && parseInt(i.quantity, 10) > 0);
    if (validItems.length === 0) {
      return setError('Please add at least one valid product line with quantity > 0');
    }

    setLoading(true);

    try {
      const res = await api.post('/deliveries', {
        customer_id: customerId || null,
        scheduled_date: scheduledDate,
        notes,
        items: validItems.map(i => ({ product_id: parseInt(i.product_id, 10), quantity: parseInt(i.quantity, 10) }))
      });

      navigate(`/deliveries/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create delivery order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <button
        onClick={() => navigate('/deliveries')}
        className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Delivery Orders</span>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Create New Delivery Order</h1>
            <p className="text-xs text-slate-400">Record outgoing customer order (Initial status: Draft)</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Customer / Client
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="">Select Customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Scheduled Delivery Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Products to Deliver
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-950/80 text-sky-400 border border-sky-800/80 hover:bg-sky-900 rounded-xl text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product Line</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex-1">
                    <select
                      required
                      value={item.product_id}
                      onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          [{p.sku}] {p.name} (On Hand: {p.total_on_hand || 0} {p.uom})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-32">
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white text-right focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length === 1}
                    className="p-2 text-slate-500 hover:text-rose-400 disabled:opacity-30 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Special Delivery Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add optional notes or shipping instructions..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/deliveries')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-950/50 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Save Delivery Order'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
