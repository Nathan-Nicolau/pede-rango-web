import React from 'react';
import { X, Clock, MapPin, User, Package, CheckCircle2 } from 'lucide-react';

export function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;

  const STATUSES = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'];

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                Pedido #{order.codigo || order.id}
              </h2>
              <span className={`status-badge status-${order.status}`}>
                {order.status}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Clock size={14} /> Criado em: {formatDate(order.criadoEm || order.createdAt)}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Customer & Address Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px',
          backgroundColor: '#0f172a',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
              <User size={16} /> Cliente
            </div>
            <div style={{ fontWeight: 600, color: '#f8fafc' }}>{order.nomeCliente || order.customerName || 'Cliente sem nome'}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
              <MapPin size={16} /> Endereço de Entrega
            </div>
            <div style={{ fontWeight: 500, color: '#f8fafc', fontSize: '0.9rem' }}>{order.enderecoEntrega || order.deliveryAddress || 'Endereço não informado'}</div>
          </div>
        </div>

        {/* Status Update Select */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Atualizar Status do Pedido:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => onUpdateStatus(order.id, st)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: order.status === st ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                  backgroundColor: order.status === st ? 'rgba(249, 115, 22, 0.2)' : '#0f172a',
                  color: order.status === st ? 'var(--primary-accent)' : 'var(--text-main)',
                  transition: 'all 0.2s ease'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Order Items Table */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={18} /> Itens do Pedido ({(order.itens || order.items) ? (order.itens || order.items).length : 0})
          </h3>
          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#1e293b' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Item</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'center' }}>Qtd</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Unitário</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(order.itens || order.items) && (order.itens || order.items).map((item, i) => {
                  const name = item.nome || item.name;
                  const qty = item.quantidade ?? item.quantity ?? 1;
                  const unitPrice = item.precoUnitario ?? item.unitPrice ?? 0;
                  const subtotal = item.subtotal ?? (qty * unitPrice);

                  return (
                    <tr key={item.id || i} style={{ borderBottom: i < (order.itens || order.items).length - 1 ? '1px solid #334155' : 'none' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{name}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{qty}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>R$ {Number(unitPrice).toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--primary-accent)' }}>
                        R$ {Number(subtotal).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total amount summary */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Valor Total:</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
            R$ {Number(order.valorTotal ?? order.totalAmount ?? 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
