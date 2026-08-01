import React from 'react';
import { X, Clock, MapPin, User, Package } from 'lucide-react';

export function OrderDetailModal({ pedido, aoFechar, aoAtualizarStatus }) {
  if (!pedido) return null;

  const STATUS_POSSIDEIS = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'];

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
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Cabeçalho */}
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
                Pedido #{codigoExibicao}
              </h2>
              <span className={`status-badge status-${pedido.status}`}>
                {pedido.status}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Clock size={14} /> Criado em: {formatarData(dataCriacao)}
            </span>
          </div>
          <button
            onClick={aoFechar}
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

        {/* Detalhes do Cliente e Endereço */}
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
            <div style={{ fontWeight: 600, color: '#f8fafc' }}>{clienteNome}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
              <MapPin size={16} /> Endereço de Entrega
            </div>
            <div style={{ fontWeight: 500, color: '#f8fafc', fontSize: '0.9rem' }}>{enderecoEntrega}</div>
          </div>
        </div>

        {/* Seletor de Atualização de Status */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Atualizar Status do Pedido:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {STATUS_POSSIDEIS.map((st) => (
              <button
                key={st}
                onClick={() => aoAtualizarStatus(pedido.id, st)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: pedido.status === st ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                  backgroundColor: pedido.status === st ? 'rgba(211, 1, 1, 0.2)' : '#0f172a',
                  color: pedido.status === st ? 'var(--primary-accent)' : 'var(--text-main)',
                  transition: 'all 0.2s ease'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Itens do Pedido */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={18} /> Itens do Pedido ({listaItens.length})
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
                {listaItens.map((item, i) => {
                  const nome = item.nome || item.name;
                  const qtd = item.quantidade ?? item.quantity ?? 1;
                  const precoUnitario = item.precoUnitario ?? item.unitPrice ?? 0;
                  const subtotal = item.subtotal ?? (qtd * precoUnitario);

                  return (
                    <tr key={item.id || i} style={{ borderBottom: i < listaItens.length - 1 ? '1px solid #334155' : 'none' }}>
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

        {/* Resumo do Valor Total */}
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
            R$ {valorTotal}
          </span>
        </div>
      </div>
    </div>
  );
}
