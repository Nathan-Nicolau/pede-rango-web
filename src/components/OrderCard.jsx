import React from 'react';
import { User, MapPin, Package, Clock } from 'lucide-react';

export function OrderCard({ pedido, aoClicar, aoAtualizarStatus }) {
  const STATUS_POSSIDEIS = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'];

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    try {
      return new Date(dataStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dataStr;
    }
  };

  const aoAlterarStatusSelect = (e) => {
    e.stopPropagation();
    aoAtualizarStatus(pedido.id, e.target.value);
  };

  const listaItens = pedido.itens || pedido.items || [];
  const valorTotal = Number(pedido.valorTotal ?? pedido.totalAmount ?? 0).toFixed(2);
  const clienteNome = pedido.nomeCliente || pedido.customerName || 'Cliente sem nome';
  const enderecoEntrega = pedido.enderecoEntrega || pedido.deliveryAddress || 'Endereço não informado';
  const codigoExibicao = pedido.codigo || pedido.id;
  const dataCriacao = pedido.criadoEm || pedido.createdAt;

  return (
    <div
      onClick={() => aoClicar(pedido)}
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
      {/* Topo: ID / Código, Hora & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            #{codigoExibicao}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {formatarData(dataCriacao)}
          </span>
        </div>
        <span className={`status-badge status-${pedido.status}`}>
          {pedido.status}
        </span>
      </div>

      {/* Informações do Cliente */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: 600 }}>
          <User size={16} color="var(--primary-accent)" />
          <span>{clienteNome}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <MapPin size={16} color="var(--text-secondary)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
            {enderecoEntrega}
          </span>
        </div>
      </div>

      {/* Resumo dos Itens & Total */}
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
          <Package size={14} /> {listaItens.length} {listaItens.length === 1 ? 'item' : 'itens'}
        </span>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
          R$ {valorTotal}
        </span>
      </div>

      {/* Alteração rápida de status */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Alterar status:</span>
        <select
          value={pedido.status}
          onChange={aoAlterarStatusSelect}
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
          {STATUS_POSSIDEIS.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
