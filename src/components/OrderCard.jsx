import React from 'react';
import { User, MapPin, Package, Clock, ChevronRight } from 'lucide-react';

export function OrderCard({ order, onClick, onUpdateStatus }) {
  const STATUSES = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'];

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const handleStatusSelectChange = (e) => {
    e.stopPropagation();
    onUpdateStatus(order.id, e.target.value);
  };

  return (
    <div
      onClick={() => onClick(order)}
      className="glass-panel"
      style={{
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Top row: Order ID, Time & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            #{order.codigo || order.id}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {formatDate(order.criadoEm || order.createdAt)}
          </span>
        </div>
        <span className={`status-badge status-${order.status}`}>
          {order.status}
        </span>
      </div>

      {/* Customer info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: 600 }}>
          <User size={16} color="var(--primary-accent)" />
          <span>{order.nomeCliente || order.customerName || 'Cliente sem nome'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <MapPin size={16} color="var(--text-secondary)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
            {order.enderecoEntrega || order.deliveryAddress || 'Endereço não informado'}
          </span>
        </div>
      </div>

      {/* Items preview & Total */}
      <div style={{
        backgroundColor: '#0f172a',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Package size={14} /> {(order.itens || order.items) ? (order.itens || order.items).length : 0} {(order.itens || order.items)?.length === 1 ? 'item' : 'itens'}
        </span>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
          R$ {Number(order.valorTotal ?? order.totalAmount ?? 0).toFixed(2)}
        </span>
      </div>

      {/* Quick Status Control Dropdown */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Alterar status:</span>
        <select
          value={order.status}
          onChange={handleStatusSelectChange}
          style={{
            backgroundColor: '#1e293b',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {STATUSES.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
