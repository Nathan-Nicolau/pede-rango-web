import React from 'react';
import { User, MapPin, Package, Clock, XCircle } from 'lucide-react';
import { labelStatus, LISTA_STATUS_PEDIDO } from '../utils/statusLabels';

export function OrderCard({ pedido, usuario, aoClicarCard, aoAtualizarStatus, aoCancelarPedido }) {
  const perfil = usuario?.perfil || 'CLIENTE';

  // Statuses Finais e Imutáveis por Qualquer Perfil: ENTREGUE e CANCELADO
  const isFinalizado = pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO';

  // Permissão de alteração direta de status por perfil (apenas em pedidos ativos)
  const podeAlterarStatus = (perfil === 'ADMIN' || perfil === 'ENTREGADOR') && !isFinalizado;

  // Permissão de cancelamento obrigatório com motivo:
  // Pedidos com o status 'RECEBIDO', 'ENTREGUE' ou 'CANCELADO' NÃO podem mais ser cancelados.
  // Apenas ADMIN pode cancelar pedidos em andamento ('EM_PREPARO' ou 'PRONTO_PARA_ENTREGA').
  const podeCancelar = !isFinalizado && pedido.status !== 'RECEBIDO' && (
    perfil === 'ADMIN' && ['EM_PREPARO', 'PRONTO_PARA_ENTREGA'].includes(pedido.status)
  );

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
      onClick={() => aoClicarCard && aoClicarCard(pedido)}
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
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Topo: ID / Código, Hora & Status com Espaçamento Adequado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            #{codigoExibicao}
          </span>
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            paddingLeft: '10px',
            borderLeft: '1px solid var(--border-color)',
            marginLeft: '4px'
          }}>
            <Clock size={13} /> {formatarData(dataCriacao)}
          </span>
        </div>
        <span className={`status-badge status-${pedido.status}`} style={{ flexShrink: 0, marginLeft: '12px' }}>
          {labelStatus(pedido.status)}
        </span>
      </div>

      {/* Informações do Cliente */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 600 }}>
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
        backgroundColor: 'var(--bg-input)',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Package size={14} /> {listaItens.length} {listaItens.length === 1 ? 'item' : 'itens'}
        </span>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-accent)', marginLeft: 'auto' }}>
          R$ {valorTotal}
        </span>
      </div>

      {/* Ações Específicas por Perfil */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}
      >
        {podeAlterarStatus ? (
          <>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Alterar status:</span>
            <select
              value={pedido.status}
              onChange={aoAlterarStatusSelect}
              style={{
                backgroundColor: 'var(--bg-input)',
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
              {LISTA_STATUS_PEDIDO.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </>
        ) : podeCancelar ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              aoCancelarPedido && aoCancelarPedido(pedido);
            }}
            style={{
              width: '100%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '8px 12px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'}
          >
            <XCircle size={15} /> Cancelar Pedido
          </button>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔒 {isFinalizado ? 'Pedido finalizado' : 'Status fixo'} ({labelStatus(pedido.status)})
          </span>
        )}
      </div>
    </div>
  );
}
