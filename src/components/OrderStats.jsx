import React from 'react';
import { ShoppingBag, Clock, Truck, CheckCircle2, PackageCheck } from 'lucide-react';

export function OrderStats({ pedidos = [] }) {
  const totalPedidos = pedidos.length;
  const recebidos = pedidos.filter(p => p.status === 'RECEBIDO').length;
  const emPreparo = pedidos.filter(p => p.status === 'EM_PREPARO').length;
  const prontoParaEntrega = pedidos.filter(p => p.status === 'PRONTO_PARA_ENTREGA').length;
  const emEntrega = pedidos.filter(p => p.status === 'SAIU_PARA_ENTREGA').length;
  const entregues = pedidos.filter(p => p.status === 'ENTREGUE').length;

  const estatisticas = [
    {
      titulo: 'Total de Pedidos',
      valor: totalPedidos,
      icone: <ShoppingBag size={22} color="var(--primary-accent)" />,
      corBorda: 'rgba(211, 1, 1, 0.3)'
    },
    {
      titulo: 'Em Preparo / Recebidos',
      valor: recebidos + emPreparo,
      icone: <Clock size={22} color="#fbbf24" />,
      corBorda: 'rgba(245, 158, 11, 0.3)'
    },
    {
      titulo: 'Pronto para Entrega',
      valor: prontoParaEntrega,
      icone: <PackageCheck size={22} color="#22d3ee" />,
      corBorda: 'rgba(34, 211, 238, 0.3)'
    },
    {
      titulo: 'Saiu para Entrega',
      valor: emEntrega,
      icone: <Truck size={22} color="#c084fc" />,
      corBorda: 'rgba(168, 85, 247, 0.3)'
    },
    {
      titulo: 'Entregues',
      valor: entregues,
      icone: <CheckCircle2 size={22} color="#34d399" />,
      corBorda: 'rgba(16, 185, 129, 0.3)'
    }
  ];

  return (
    <div className="order-stats-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '28px'
    }}>
      {estatisticas.map((stat, idx) => (
        <div
          key={idx}
          className={`glass-panel order-stats-card order-stats-card-${idx}`}
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            borderLeft: `4px solid ${stat.corBorda.replace('0.3', '1')}`,
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}
        >
          <div className="order-stats-info">
            <span className="order-stats-title" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {stat.titulo}
            </span>
            <div className="order-stats-value" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {stat.valor}
            </div>
          </div>
          <div className="order-stats-icon-wrapper" style={{
            backgroundColor: 'var(--bg-input)',
            padding: '12px',
            borderRadius: '12px',
            border: `1px solid ${stat.corBorda}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {stat.icone}
          </div>
        </div>
      ))}
    </div>
  );
}
