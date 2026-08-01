import React from 'react';
import { ShoppingBag, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';

export function OrderStats({ orders }) {
  const totalOrders = orders.length;
  const recebidos = orders.filter(o => o.status === 'RECEBIDO').length;
  const emPreparo = orders.filter(o => o.status === 'EM_PREPARO').length;
  const emEntrega = orders.filter(o => o.status === 'SAIU_PARA_ENTREGA').length;
  const entregues = orders.filter(o => o.status === 'ENTREGUE').length;

  const stats = [
    {
      title: 'Total de Pedidos',
      count: totalOrders,
      icon: <ShoppingBag size={22} color="var(--primary-accent)" />,
      borderColor: 'rgba(249, 115, 22, 0.3)'
    },
    {
      title: 'Em Preparo / Recebidos',
      count: recebidos + emPreparo,
      icon: <Clock size={22} color="#fbbf24" />,
      borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    {
      title: 'Saiu para Entrega',
      count: emEntrega,
      icon: <Truck size={22} color="#c084fc" />,
      borderColor: 'rgba(168, 85, 247, 0.3)'
    },
    {
      title: 'Entregues',
      count: entregues,
      icon: <CheckCircle2 size={22} color="#34d399" />,
      borderColor: 'rgba(16, 185, 129, 0.3)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '28px'
    }}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="glass-panel"
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            borderLeft: `4px solid ${stat.borderColor.replace('0.3', '1')}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {stat.title}
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
              {stat.count}
            </div>
          </div>
          <div style={{
            backgroundColor: '#0f172a',
            padding: '12px',
            borderRadius: '12px',
            border: `1px solid ${stat.borderColor}`
          }}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
