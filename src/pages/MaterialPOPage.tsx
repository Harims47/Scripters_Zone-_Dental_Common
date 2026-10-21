import { useState, useEffect } from 'react';
import { ShoppingCart, Boxes, Building2, Truck, CheckCircle2 } from 'lucide-react';
import { PurchaseOrdersTab } from '../components/inventory/PurchaseOrdersTab';
import { api } from '../lib/api';

export function MaterialPOPage() {
  const [stats, setStats] = useState({
    total: 0,
    ordered: 0,
    received: 0,
    totalSpend: 0
  });

  const refreshStats = () => {
    api.get<any[]>('/api/purchase-orders')
      .then(orders => {
        if (!Array.isArray(orders)) return;
        const matOrders = orders.filter(po => {
          if (po.notes?.includes('[Material PO]')) return true;
          if (po.items?.some((i: any) => {
            const f = (i.medicine?.form || '').toLowerCase();
            const cat = (i.medicine?.category?.name || '').toLowerCase();
            return f.includes('material') || cat.includes('material') || cat.includes('endo') || cat.includes('ortho') || cat.includes('prostho') || cat.includes('implant') || cat.includes('consumable');
          })) return true;
          return false;
        });

        const total = matOrders.length;
        const ordered = matOrders.filter(po => po.status === 'Ordered' || po.status === 'Partially Received').length;
        const received = matOrders.filter(po => po.status === 'Received').length;
        const totalSpend = matOrders
          .filter(po => po.status !== 'Cancelled')
          .reduce((sum, po) => {
            const itemsCost = (po.items || []).reduce((itemSum: number, item: any) => {
              return itemSum + (Number(item.orderedQuantity || 0) * Number(item.unitCost || 0));
            }, 0);
            return sum + (itemsCost || Number(po.totalAmount) || 0);
          }, 0);

        setStats({ total, ordered, received, totalSpend });
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <div className="flex-1 bg-slate-50/50 flex flex-col min-w-0 w-full overflow-y-auto">
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shadow-xs">
                <Boxes className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Dental Material Purchase Orders
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1.5 ml-11.5">
              Dedicated procurement workflow for clinic consumables, dental materials, and lab supplier orders.
            </p>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Material POs</span>
              <span className="text-xl font-bold text-slate-900">{stats.total}</span>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Pending Delivery</span>
              <span className="text-xl font-bold text-amber-700">{stats.ordered}</span>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Goods Received</span>
              <span className="text-xl font-bold text-emerald-700">{stats.received}</span>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Spend</span>
              <span className="text-xl font-bold text-teal-700">₹{stats.totalSpend.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Dedicated Purchase Orders Tab locked strictly to MATERIAL */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <PurchaseOrdersTab lockType="material" onGoodsReceived={refreshStats} onOrdersUpdated={refreshStats} />
        </div>
      </div>
    </div>
  );
}
