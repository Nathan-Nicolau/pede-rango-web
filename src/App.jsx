import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { OrderStats } from './components/OrderStats';
import { OrderCard } from './components/OrderCard';
import { CreateOrderModal } from './components/CreateOrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { authService, orderService } from './services/api';
import { Search, Filter, RefreshCw, AlertTriangle, Plus } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar lista de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setUser(authService.getCurrentUser());
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setOrders([]);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const handleOrderCreated = (newOrder) => {
    setOrders([newOrder, ...orders]);
  };

  const filteredOrders = orders.filter(order => {
    const customerName = order.nomeCliente || order.customerName || '';
    const address = order.enderecoEntrega || order.deliveryAddress || '';
    const code = (order.codigo || order.id || '').toString();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = customerName.toLowerCase().includes(searchLower) ||
                          address.toLowerCase().includes(searchLower) ||
                          code.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenNewOrder={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {!isAuthenticated ? (
          <AuthModal onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            {/* Live Stats */}
            <OrderStats orders={orders} />

            {/* Filter and Search Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px',
              backgroundColor: 'var(--bg-card)',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)'
            }}>
              {/* Search input */}
              <div style={{ position: 'relative', flex: '1 1 300px' }}>
                <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar por ID, código, cliente ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px', width: '100%' }}
                />
              </div>

              {/* Status filter dropdown & Refresh */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="var(--text-secondary)" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-input"
                    style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: '10px' }}
                  >
                    <option value="ALL">Todos os Status</option>
                    <option value="RECEBIDO">RECEBIDO</option>
                    <option value="EM_PREPARO">EM_PREPARO</option>
                    <option value="SAIU_PARA_ENTREGA">SAIU_PARA_ENTREGA</option>
                    <option value="ENTREGUE">ENTREGUE</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                </div>

                <button
                  onClick={fetchOrders}
                  className="btn-secondary"
                  style={{ padding: '10px 14px' }}
                  title="Atualizar lista"
                >
                  <RefreshCw size={16} className={loading ? 'spin' : ''} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={20} />
                  <span>{error} (Certifique-se de que a API Spring Boot está rodando em http://localhost:8100)</span>
                </div>
                <button onClick={fetchOrders} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Orders Grid */}
            {loading && orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                Carregando pedidos...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
                  Nenhum pedido encontrado
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  {searchTerm || statusFilter !== 'ALL'
                    ? 'Tente alterar os filtros de busca para encontrar pedidos.'
                    : 'Crie seu primeiro pedido para visualizar no painel!'}
                </p>
                {!searchTerm && statusFilter === 'ALL' && (
                  <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
                    <Plus size={18} /> Criar Primeiro Pedido
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={(ord) => setSelectedOrder(ord)}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateOrderModal
          onClose={() => setIsCreateModalOpen(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
