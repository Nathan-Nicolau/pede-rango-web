import React from 'react';
import { Truck, MapPin, User, Phone, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

export function ActiveDeliveryRidersCard({ pedidos = [] }) {
  // Filtra pedidos em rota de entrega ("SAIU_PARA_ENTREGA")
  const pedidosEmRota = pedidos.filter(p => p.status === 'SAIU_PARA_ENTREGA');

  if (pedidosEmRota.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          borderRadius: '18px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeft: '4px solid var(--primary-accent)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            backgroundColor: 'rgba(211, 1, 1, 0.15)',
            padding: '12px',
            borderRadius: '12px',
            color: 'var(--primary-accent)'
          }}>
            <Truck size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Entregadores em Rota de Entrega
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Nenhum entregador em trânsito no momento (0 rotas ativas).
            </p>
          </div>
        </div>
        <span className="status-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
          Disponíveis para Chamada
        </span>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Truck size={22} color="var(--primary-accent)" />
          Entregadores em Rota de Entrega ({pedidosEmRota.length})
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#c084fc', backgroundColor: 'rgba(168, 85, 247, 0.15)', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(192, 132, 252, 0.3)', fontWeight: 600 }}>
          ⚡ Rotas em Andamento
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {pedidosEmRota.map((pedido) => {
          const nomeEntregador = pedido.nomeEntregador || pedido.entregadorNome || 'Entregador Desconhecido';
          const codigoPedido = pedido.codigo || pedido.id;
          const clienteNome = pedido.nomeCliente || 'Cliente';
          const endereco = pedido.enderecoEntrega || 'Endereço não informado';

          return (
            <div
              key={pedido.id}
              className="glass-panel"
              style={{
                padding: '18px 20px',
                borderRadius: '16px',
                borderLeft: '4px solid #c084fc',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    color: '#c084fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {nomeEntregador}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Pedido #{codigoPedido}
                    </span>
                  </div>
                </div>
                <span className="status-badge status-SAIU_PARA_ENTREGA">
                  EM ROTA
                </span>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-input)',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                  <User size={14} color="var(--primary-accent)" /> Cliente: {clienteNome}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} /> {endereco}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
