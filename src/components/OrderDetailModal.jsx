import { labelStatus, obterOpcoesStatusProximos, podeAlterarStatusPedido, formatarDataHora, labelMotivoCancelamento } from '../utils/statusLabels';
import { X, Clock, MapPin, User, Package, PackageCheck, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export function OrderDetailModal({ pedido, usuario, aoFechar, aoAtualizarStatus }) {
  if (!pedido) return null;

  const perfil = usuario?.perfil || 'CLIENTE';
  const podeAlterar = podeAlterarStatusPedido(pedido, perfil);
  const opcoesProximas = obterOpcoesStatusProximos(pedido.status);

  const listaItens = pedido.itens || pedido.items || [];
  const valorTotal = Number(pedido.valorTotal ?? pedido.totalAmount ?? 0).toFixed(2);
  const clienteNome = pedido.nomeCliente || pedido.customerName || 'Cliente sem nome';
  const enderecoEntrega = pedido.enderecoEntrega || pedido.deliveryAddress || 'Endereço não informado';
  const codigoExibicao = pedido.codigo || pedido.id;
  const dataCriacao = pedido.criadoEm || pedido.createdAt;
  const dataEntrega = pedido.dataEntrega || pedido.deliveredAt;

  return (
    <div className="modal-overlay" onClick={aoFechar} style={{ padding: '16px' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Cabeçalho com Alinhamento Perfeito */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                Pedido #{codigoExibicao}
              </h2>
              <span className={`status-badge status-${pedido.status}`} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                {pedido.status === 'PRONTO_PARA_ENTREGA' && <PackageCheck size={14} color="#22d3ee" />}
                {labelStatus(pedido.status)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="var(--primary-accent)" /> <span><strong>Criado em:</strong> {formatarDataHora(dataCriacao)}</span>
              </div>
              {pedido.status === 'ENTREGUE' && dataEntrega && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 600 }}>
                  <CheckCircle2 size={14} color="#34d399" /> <span><strong>Entregue em:</strong> {formatarDataHora(dataEntrega)}</span>
                </div>
              )}
              {pedido.status === 'CANCELADO' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 600 }}>
                  <AlertTriangle size={14} color="#f87171" /> <span><strong>Cancelado em:</strong> {formatarDataHora(pedido.cancelamento?.canceladoEm || pedido.atualizadoEm)}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={aoFechar}
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              width: '34px',
              height: '34px',
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

        {/* Detalhes do Cancelamento (quando cancelado) */}
        {pedido.status === 'CANCELADO' && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '20px',
            fontSize: '0.88rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} /> Motivo do Cancelamento: {labelMotivoCancelamento(pedido.cancelamento?.motivo)}
            </div>
            {pedido.cancelamento?.observacoes && (
              <div style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>
                <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Observações: "{pedido.cancelamento.observacoes}"
              </div>
            )}
          </div>
        )}

        {/* Dados do Cliente e Endereço */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px',
          backgroundColor: 'var(--bg-input)',
          padding: '14px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              Cliente
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} color="var(--primary-accent)" /> {clienteNome}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              Endereço de Entrega
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} color="var(--text-secondary)" /> {enderecoEntrega}
            </div>
          </div>
        </div>

        {/* Seção de Troca de Status (Permite apenas avançar o fluxo) */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Avançar Status do Pedido:
          </label>
          {podeAlterar && opcoesProximas.length > 0 ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {opcoesProximas.map(({ value, label }) => (
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

        {/* Rodapé com Valor Total */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Valor Total:
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
            R$ {valorTotal}
          </span>
        </div>
      </div>
    </div>
  );
}
