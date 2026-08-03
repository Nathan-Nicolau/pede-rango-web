import React from 'react';
import { User, MapPin, Package, Clock, XCircle, PackageCheck, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { labelStatus, obterOpcoesStatusProximos, podeAlterarStatusPedido, podeCancelarPedido, formatarHora, formatarDataHora, labelMotivoCancelamento } from '../utils/statusLabels';

export function OrderCard({ pedido, usuario, aoClicarCard, aoAtualizarStatus, aoCancelarPedido }) {
  const perfil = usuario?.perfil || 'CLIENTE';

  const isFinalizado = pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO';
  const podeAlterarStatus = podeAlterarStatusPedido(pedido, perfil);
  const podeCancelar = podeCancelarPedido(pedido, perfil);
  const opcoesProximas = obterOpcoesStatusProximos(pedido.status);

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
  const dataEntrega = pedido.dataEntrega || pedido.deliveredAt;
  const cancelamento = pedido.cancelamento;
  const dataCancelamento = cancelamento?.canceladoEm || pedido.atualizadoEm;

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
        position: 'relative',
        borderLeft: pedido.status === 'CANCELADO' ? '4px solid #ef4444' : 'none'
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
      {/* Topo: ID / Código & Status com Prevenção de Estouro Lateral */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all', flex: 1, minWidth: '130px' }}>
          #{codigoExibicao}
        </span>
        <span className={`status-badge status-${pedido.status}`} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          {pedido.status === 'PRONTO_PARA_ENTREGA' && <PackageCheck size={14} color="#22d3ee" />}
          {labelStatus(pedido.status)}
        </span>
      </div>

      {/* Exibição Clara de Datas: Criação, Entrega e Cancelamento */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} color="var(--primary-accent)" />
          <span><strong>Criado em:</strong> {formatarDataHora(dataCriacao)}</span>
        </div>

        {/* Data e Status de Entrega */}
        {pedido.status === 'ENTREGUE' && dataEntrega && (
          <div style={{
            fontSize: '0.8rem', color: '#34d399', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(16,185,129,0.12)', padding: '6px 10px',
            borderRadius: '8px', border: '1px solid rgba(52,211,153,0.3)',
            marginTop: '2px'
          }}>
            <CheckCircle2 size={14} color="#34d399" />
            <span><strong>Entregue em:</strong> {formatarDataHora(dataEntrega)}</span>
          </div>
        )}

        {/* Data e Motivo do Cancelamento */}
        {pedido.status === 'CANCELADO' && (
          <div style={{
            fontSize: '0.8rem', color: '#f87171', fontWeight: 500,
            display: 'flex', flexDirection: 'column', gap: '4px',
            backgroundColor: 'rgba(239,68,68,0.1)', padding: '8px 12px',
            borderRadius: '10px', border: '1px solid rgba(239,68,68,0.25)',
            marginTop: '4px'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
              <AlertTriangle size={14} color="#f87171" />
              <span>Motivo: {labelMotivoCancelamento(cancelamento?.motivo)}</span>
            </div>
            {cancelamento?.observacoes && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Obs: "{cancelamento.observacoes}"
              </div>
            )}
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Clock size={12} />
              <span><strong>Cancelado em:</strong> {formatarDataHora(dataCancelamento)}</span>
            </div>
          </div>
        )}
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
        {podeAlterarStatus && opcoesProximas.length > 0 ? (
          <>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Avançar status:</span>
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
              {opcoesProximas.map(({ value, label }) => (
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
