import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Package, Users, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { Card, Badge, Spinner } from '../components/UI';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const invoicesData = await api.getInvoices();
      
      const total = invoicesData.length;
      const pending = invoicesData.filter(inv => inv.status === 'pending').length;
      const revenue = invoicesData.reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      const now = new Date();
      const monthlyInvoices = invoicesData.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
      });
      const monthlyRev = monthlyInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

      setStats({
        totalInvoices: total,
        pendingInvoices: pending,
        totalRevenue: revenue,
        monthlyRevenue: monthlyRev,
      });

      setRecentInvoices(invoicesData.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', label: 'Pendiente', icon: Clock },
      paid: { variant: 'success', label: 'Pagado', icon: CheckCircle },
      cancelled: { variant: 'danger', label: 'Cancelado', icon: null }
    };
    
    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant}>
        {Icon && <Icon size={14} />}
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Facturas</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{stats.totalInvoices}</p>
            </div>
            <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={28} />
            </div>
          </div>
        </Card>

        <Card className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pendientes</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{stats.pendingInvoices}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="text-white" size={28} />
            </div>
          </div>
        </Card>

        <Card className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Ingresos Totales</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="text-white" size={28} />
            </div>
          </div>
        </Card>

        <Card className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Este Mes</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={28} />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card title="Facturas Recientes">
        {recentInvoices.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>No hay facturas registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-800 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{invoice.invoice_number}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {invoice.customer?.name || 'Cliente no disponible'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(invoice.total)}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(invoice.created_at).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
