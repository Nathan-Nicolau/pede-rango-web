import React, { useState } from 'react';
import { Truck, MapPin, User, Package, X, Clock, ChevronRight, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { labelStatus, formatarDataHora } from '../utils/statusLabels';

export function ActiveDeliveryRidersCard({ pedidos = [], usuario }) {
  const [modalEntregadorSelecionado, setModalEntregadorSelecionado] = useState(null);
  const [pedidosExpandidos, setPedidosExpandidos] = useState({});

  const perfil = usuario?.perfil || 'CLIENTE';

  // Alterna o estado expandido/recolhido de um pedido específico
  const alternarExpansaoPedido = (idPedido) => {
    setPedidosExpandidos(prev => ({
      ...prev,
      [idPedido]: !prev[idPedido]
    }));
  };

  // Filtra pedidos em rota de entrega ("SAIU_PARA_ENTREGA")
  const todosPedidosEmRota = pedidos.filter(p => p.status === 'SAIU_PARA_ENTREGA');

  // =========================================================================
  // CASO DE USO 1: PERFIL CLIENTE (Privacidade Estrita & Visão Individual)
  // =========================================================================
  if (perfil === 'CLIENTE') {
    const meusPedidosEmRota = todosPedidosEmRota.filter(p => {
      if (p.clienteId && usuario?.id) {
        return String(p.clienteId) === String(usuario.id);
      }
      if (p.nomeCliente && usuario?.nome) {
        return p.nomeCliente.toLowerCase() === usuario.nome.toLowerCase();
      }
      return true;
    });

    if (meusPedidosEmRota.length === 0) {
      return null;
    }

    return (
      <div style={{ marginBottom: '28px' }}>
        <div className="active-riders-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Truck size={22} color="var(--primary-accent)" />
            Acompanhamento de Entrega ({meusPedidosEmRota.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#c084fc', backgroundColor: 'rgba(168, 85, 247, 0.15)', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(192, 132, 252, 0.3)', fontWeight: 600 }}>
            🛵 Seu Pedido está a Caminho!
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {meusPedidosEmRota.map((pedido) => {
            const nomeEntregador = pedido.nomeEntregador || pedido.entregadorNome || 'Entregador atribuído';
            const codigoPedido = pedido.codigo || pedido.id;
            const endereco = pedido.enderecoEntrega || 'Endereço não informado';
            const valorTotalPed = Number(pedido.valorTotal ?? pedido.totalAmount ?? 0).toFixed(2);

            return (
              <div
                key={pedido.id}
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  borderRadius: '18px',
                  borderLeft: '4px solid #c084fc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(168, 85, 247, 0.2)',
                      color: '#c084fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      <Truck size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        {nomeEntregador}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                    <MapPin size={15} color="var(--primary-accent)" /> Endereço de Entrega: {endereco}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Valor Total:</span>
                    <strong style={{ color: 'var(--primary-accent)', fontSize: '0.95rem' }}>R$ {valorTotalPed}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASO DE USO 2: PERFIL ADMIN / RESTAURANTE / ENTREGADOR (Visão da Frota)
  // =========================================================================
  if (todosPedidosEmRota.length === 0) {
    return (
      <div
        className="glass-panel active-riders-empty-card"
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
        <span className="status-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
          Disponíveis para Chamada
        </span>
      </div>
    );
  }

  // Agrupa pedidos por entregador para o Administrador
  const agrupamentoPorEntregador = todosPedidosEmRota.reduce((acc, pedido) => {
    const chave = pedido.entregadorId || pedido.nomeEntregador || 'sem-id';
    if (!acc[chave]) {
      acc[chave] = {
        entregadorId: pedido.entregadorId,
        nomeEntregador: pedido.nomeEntregador || pedido.entregadorNome || 'Entregador em Rota',
        pedidos: []
      };
    }
    acc[chave].pedidos.push(pedido);
    return acc;
  }, {});

  const listaGrupos = Object.values(agrupamentoPorEntregador);

  return (
    <div style={{ marginBottom: '28px' }}>
      <div className="active-riders-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Truck size={22} color="var(--primary-accent)" />
          Entregadores em Rota de Entrega ({listaGrupos.length})
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
        {listaGrupos.map((grupo) => {
          const totalPedidosRider = grupo.pedidos.length;
          const primeiroPedido = grupo.pedidos[0];

          return (
            <div
              key={grupo.entregadorId || grupo.nomeEntregador}
              className="glass-panel"
              onClick={() => setModalEntregadorSelecionado(grupo)}
              style={{
                padding: '18px 20px',
                borderRadius: '16px',
                borderLeft: '4px solid #c084fc',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              {/* Header do Card do Entregador */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
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
                      {grupo.nomeEntregador}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Package size={13} /> {totalPedidosRider} {totalPedidosRider === 1 ? 'pedido para entrega' : 'pedidos para entrega'}
                    </span>
                  </div>
                </div>

                <span className="status-badge status-SAIU_PARA_ENTREGA" style={{ flexShrink: 0 }}>
                  EM ROTA
                </span>
              </div>

              {/* Card Interno Informativo com Detalhes Rápidos */}
              <div style={{
                backgroundColor: 'var(--bg-input)',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-main)', fontWeight: 600 }}>
                  <span><User size={14} color="var(--primary-accent)" style={{ display: 'inline', marginRight: '6px' }} /> Cliente: {primeiroPedido?.nomeCliente || 'Cliente'}</span>
                  {totalPedidosRider > 1 && (
                    <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                      +{totalPedidosRider - 1} outro(s)
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} color="var(--text-secondary)" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px' }}>
                    {primeiroPedido?.enderecoEntrega || 'Endereço não informado'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '0.78rem', color: '#c084fc', fontWeight: 600, gap: '4px' }}>
                Clique para ver todos os pedidos <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhes dos Pedidos do Entregador (Administrador) */}
      {modalEntregadorSelecionado && (
        <div className="modal-overlay" onClick={() => setModalEntregadorSelecionado(null)} style={{ padding: '16px' }}>
          <div className="modal-content modal-content-xl" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            {/* Cabeçalho do Modal */}
            <div style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'flex-start',
              width: '100%',
              gap: '16px',
              marginBottom: '20px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Truck size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', wordBreak: 'break-word' }}>
                    Pedidos de {modalEntregadorSelecionado.nomeEntregador}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    {modalEntregadorSelecionado.pedidos.length} {modalEntregadorSelecionado.pedidos.length === 1 ? 'pedido em rota de entrega' : 'pedidos em rota de entrega'} • Clique em um pedido para ver os itens detalhados
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalEntregadorSelecionado(null)}
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
                  marginLeft: 'auto'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Lista de Pedidos Expandíveis do Entregador */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
              {modalEntregadorSelecionado.pedidos.map((p) => {
                const itensList = p.itens || p.items || [];
                const valorTotalPed = Number(p.valorTotal ?? p.totalAmount ?? 0).toFixed(2);
                const isExpandido = !!pedidosExpandidos[p.id];

                return (
                  <div
                    key={p.id}
                    onClick={() => alternarExpansaoPedido(p.id)}
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderRadius: '14px',
                      border: isExpandido ? '1px solid var(--primary-accent)' : '1px solid var(--border-color)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Linha Superior: Código, Data & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          #{p.codigo || p.id}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} color="var(--primary-accent)" /> {formatarDataHora(p.criadoEm || p.createdAt)}
                        </span>
                      </div>
                      <span className="status-badge status-SAIU_PARA_ENTREGA">
                        SAIU PARA ENTREGA
                      </span>
                    </div>

                    {/* Dados do Cliente e Endereço */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.88rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CLIENTE</span>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={15} color="var(--primary-accent)" /> {p.nomeCliente || 'Cliente'}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ENDEREÇO</span>
                        <div style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={15} color="var(--text-secondary)" /> {p.enderecoEntrega || 'Endereço'}
                        </div>
                      </div>
                    </div>

                    {/* Barra de Resumo de Itens / Alternador Expandido */}
                    <div style={{
                      backgroundColor: 'var(--bg-card)',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={15} color="var(--primary-accent)" />
                        Itens ({itensList.length}): <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{itensList.map(it => `${it.quantidade || 1}x ${it.nome || it.name}`).join(', ')}</span>
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--primary-accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        {isExpandido ? 'Ocultar itens' : 'Expandir itens'}
                        {isExpandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>

                    {/* Tabela Detalhada de Itens (Quando Expandido) */}
                    {isExpandido && (
                      <div style={{
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden',
                        marginTop: '2px'
                      }}>
                        <div style={{
                          padding: '8px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--bg-card-hover)',
                          borderBottom: '1px solid var(--border-color)'
                        }}>
                          Detalhamento dos Itens do Pedido
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                              <th style={{ padding: '8px 12px' }}>Item</th>
                              <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qtd</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unitário</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itensList.map((it, idx) => {
                              const nomeItem = it.nome || it.name;
                              const qtdItem = it.quantidade ?? it.quantity ?? 1;
                              const precoUnit = it.precoUnitario ?? it.unitPrice ?? 0;
                              const subtotalItem = it.subtotal ?? (qtdItem * precoUnit);
                              return (
                                <tr key={it.id || idx} style={{ borderBottom: idx < itensList.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                  <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-main)' }}>{nomeItem}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{qtdItem}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>R$ {Number(precoUnit).toFixed(2)}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--primary-accent)' }}>
                                    R$ {Number(subtotalItem).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Rodapé com Valor Total do Pedido */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Valor Total do Pedido:</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-accent)' }}>R$ {valorTotalPed}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
