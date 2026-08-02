import React from 'react';
import { X, Clock, MapPin, User, Package } from 'lucide-react';
import { labelStatus, LISTA_STATUS_PEDIDO } from '../utils/statusLabels';

export function OrderDetailModal({ pedido, usuario, aoFechar, aoAtualizarStatus }) {
  if (!pedido) return null;

  const perfil = usuario?.perfil || 'CLIENTE';
  const statusBloqueado = ['ENTREGUE', 'RECEBIDO', 'CANCELADO'].includes(pedido.status);
  const podeAlterarStatus = (perfil === 'ADMIN' || perfil === 'ENTREGADOR') && !statusBloqueado;

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    try {
      return new Date(dataStr).toLocaleString('pt-BR');
    } catch {
      return dataStr;
    }
  };

  const listaItens = pedido.itens || pedido.items || [];
  const valorTotal = Number(pedido.valorTotal ?? pedido.totalAmount ?? 0).toFixed(2);
  const clienteNome = pedido.nomeCliente || pedido.customerName || 'Cliente sem nome';
  const enderecoEntrega = pedido.enderecoEntrega || pedido.deliveryAddress || 'Endereço não informado';
  const codigoExibicao = pedido.codigo || pedido.id;
  const dataCriacao = pedido.criadoEm || pedido.createdAt;

  return (
    <div className="modal-overlay" onClick={aoFechar} style={{ padding: '16px' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Cabeçalho com Alinhamento Perfeito (Evita Sobreposição com Botão Fechar) */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                Pedido #{codigoExibicao}
              </h2>
              <span className={`status-badge status-${pedido.status}`} style={{ flexShrink: 0 }}>
                {labelStatus(pedido.status)}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> Criado em: {formatarData(dataCriacao)}
            </span>
          </div>

          <button
            onClick={aoFechar}
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: '12px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--primary-accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Detalhes do Cliente e Endereço */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px',
          backgroundColor: 'var(--bg-input)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
              <User size={16} /> Cliente
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{clienteNome}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
              <MapPin size={16} /> Endereço de Entrega
            </div>
            <div style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{enderecoEntrega}</div>
          </div>
        </div>

        {/* Seletor de Atualização de Status */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Status do Pedido:
          </label>
          {podeAlterarStatus ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {LISTA_STATUS_PEDIDO.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => aoAtualizarStatus(pedido.id, value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: pedido.status === value ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                    backgroundColor: pedido.status === value ? 'var(--primary-accent-glow)' : 'var(--bg-input)',
                    color: pedido.status === value ? 'var(--primary-accent)' : 'var(--text-main)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              🔒 O status ({labelStatus(pedido.status)}) não pode ser alterado.
            </div>
          )}
        </div>

        {/* Tabela de Itens do Pedido */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
            <Package size={18} /> Itens do Pedido ({listaItens.length})
          </h3>
          <div style={{
            backgroundColor: 'var(--bg-input)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card-hover)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Item</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'center' }}>Qtd</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Unitário</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {listaItens.map((item, i) => {
                  const nome = item.nome || item.name;
                  const qtd = item.quantidade ?? item.quantity ?? 1;
                  const precoUnitario = item.precoUnitario ?? item.unitPrice ?? 0;
                  const subtotal = item.subtotal ?? (qtd * precoUnitario);

                  return (
                    <tr key={item.id || i} style={{ borderBottom: i < listaItens.length - 1 ? '1px solid var(--border-color)' : 'none', color: 'var(--text-main)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{nome}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{qtd}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>R$ {Number(precoUnitario).toFixed(2)}</td>
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

        {/* Resumo do Valor Total (com Espaçamento Adequado) */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-input)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Valor Total:</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-accent)', marginLeft: '12px' }}>
            R$ {valorTotal}
          </span>
        </div>
      </div>
    </div>
  );
}
