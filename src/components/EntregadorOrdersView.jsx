import React, { useState, useEffect } from 'react';
import { servicoPedidos, servicoEntregadores } from '../services/api';
import { PaginationControls } from './PaginationControls';
import { CancelOrderModal } from './CancelOrderModal';
import { Truck, CheckCircle2, Clock, MapPin, Package, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, UserCheck, XCircle } from 'lucide-react';
import { labelStatus } from '../utils/statusLabels';

export function EntregadorOrdersView({ usuario }) {
  const [pedidos, setPedidos] = useState([]);
  const [entregadorAtual, setEntregadorAtual] = useState(null);
  const [entregadoresLista, setEntregadoresLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);
  const [alternandoStatus, setAlternandoStatus] = useState(false);
  const [erro, setErro] = useState(null);
  const [abaInterna, setAbaInterna] = useState('DISPONIVEIS'); // 'DISPONIVEIS' | 'MINHAS_ENTREGAS'
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [usuario]);

  const carregarDados = async () => {
    setCarregando(true);
    setErro(null);
    try {
      // 1. Carregar lista de entregadores da API
      const respEntregadores = await servicoEntregadores.obterTodosPaginado(0, 100);
      const listaEnt = Array.isArray(respEntregadores.content) ? respEntregadores.content : [];
      setEntregadoresLista(listaEnt);

      // Tenta localizar o entregador correspondente ao usuário logado por e-mail, usuarioId ou nome
      let encontrado = listaEnt.find(e =>
        (e.email && usuario?.email && e.email.toLowerCase() === usuario.email.toLowerCase()) ||
        (e.usuarioId && usuario?.id && String(e.usuarioId) === String(usuario.id)) ||
        (e.nome && usuario?.nome && e.nome.toLowerCase() === usuario.nome.toLowerCase())
      );

      if (!encontrado && listaEnt.length > 0) {
        encontrado = listaEnt[0];
      }

      setEntregadorAtual(encontrado || null);

      // 2. Carregar todos os pedidos da API
      const respPedidos = await servicoPedidos.obterTodosPedidosPaginado(0, 100);
      const listaPed = Array.isArray(respPedidos.content) ? respPedidos.content : [];
      setPedidos(listaPed);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar dados de entregas.');
    } finally {
      setCarregando(false);
    }
  };

  // Alternar disponibilidade online/offline do entregador
  const aoAlternarStatusDisponivel = async () => {
    if (!entregadorAtual) return;
    setAlternandoStatus(true);
    const novoStatus = !(entregadorAtual.disponivel !== false);
    try {
      await servicoEntregadores.alternarDisponibilidade(entregadorAtual.id, novoStatus);
      setEntregadorAtual(prev => ({ ...prev, disponivel: novoStatus }));
    } catch (err) {
      alert('Erro ao alterar status de trabalho: ' + err.message);
    } finally {
      setAlternandoStatus(false);
    }
  };

  // Ação de Pegar Pedido (Atribuir Entregador + Alterar Status para SAIU_PARA_ENTREGA)
  const aoPegarPedido = async (pedido) => {
    if (!entregadorAtual) {
      alert('É necessário ter um cadastro de entregador ativo para aceitar pedidos.');
      return;
    }

    if (entregadorAtual.disponivel === false) {
      alert('Sua conta está OFFLINE (Indisponível). Mude seu status para ONLINE antes de pegar novos pedidos.');
      return;
    }

    setProcessandoId(pedido.id);
    try {
      // 1. Atribuir entregador ao pedido
      await servicoPedidos.atribuirEntregador(pedido.codigo || pedido.id, entregadorAtual.id);
      // 2. Atualizar status para SAIU_PARA_ENTREGA
      await servicoPedidos.atualizarStatusPedido(pedido.id, 'SAIU_PARA_ENTREGA');

      await carregarDados();
    } catch (err) {
      alert('Erro ao aceitar pedido para entrega: ' + err.message);
    } finally {
      setProcessandoId(null);
    }
  };

  // Ação de Marcar como Entregue
  const aoConcluirEntrega = async (pedidoId) => {
    setProcessandoId(pedidoId);
    try {
      await servicoPedidos.atualizarStatusPedido(pedidoId, 'ENTREGUE');
      await carregarDados();
    } catch (err) {
      alert('Erro ao concluir entrega: ' + err.message);
    } finally {
      setProcessandoId(null);
    }
  };

  // Pedidos disponíveis para o entregador pegar ("PRONTO_PARA_ENTREGA")
  const disponiveisParaEntrega = pedidos.filter(p => p.status === 'PRONTO_PARA_ENTREGA');

  // Minhas entregas em andamento ("SAIU_PARA_ENTREGA")
  const minhasEntregasEmAndamento = pedidos.filter(p => {
    if (p.status !== 'SAIU_PARA_ENTREGA') return false;
    if (!entregadorAtual) return true;
    return (p.entregadorId && String(p.entregadorId) === String(entregadorAtual.id)) ||
           (p.nomeEntregador && entregadorAtual.nome && p.nomeEntregador.toLowerCase() === entregadorAtual.nome.toLowerCase());
  });

  // Histórico de entregas concluídas pelo entregador ("ENTREGUE")
  const minhasEntregasConcluidas = pedidos.filter(p => {
    if (p.status !== 'ENTREGUE') return false;
    if (!entregadorAtual) return true;
    return (p.entregadorId && String(p.entregadorId) === String(entregadorAtual.id)) ||
           (p.nomeEntregador && entregadorAtual.nome && p.nomeEntregador.toLowerCase() === entregadorAtual.nome.toLowerCase());
  });

  const isOnline = entregadorAtual?.disponivel !== false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header do Painel do Entregador */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
        padding: '20px 24px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, var(--bg-card) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
            backgroundColor: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Truck size={26} color="#a855f7" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Painel de Entregas & Logística
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Aceite novos pedidos para transporte ou consulte o histórico das suas entregas.
            </p>
          </div>
        </div>

        {/* Status de Trabalho (Botão apenas para ENTREGADOR, Label para ADMIN) */}
        {entregadorAtual && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Status de Trabalho:
            </span>
            {usuario?.perfil === 'ADMIN' ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '0.88rem',
                fontWeight: 700,
                border: isOnline
                  ? '1px solid rgba(52, 211, 153, 0.4)'
                  : '1px solid rgba(248, 113, 113, 0.4)',
                backgroundColor: isOnline
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
                color: isOnline ? '#34d399' : '#f87171',
              }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: isOnline ? '#34d399' : '#f87171',
                }} />
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            ) : (
              <button
                type="button"
                onClick={aoAlternarStatusDisponivel}
                disabled={alternandoStatus}
                title={isOnline ? 'Clique para ficar Offline' : 'Clique para ficar Online'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: alternandoStatus ? 'wait' : 'pointer',
                  border: isOnline
                    ? '1px solid rgba(52, 211, 153, 0.4)'
                    : '1px solid rgba(248, 113, 113, 0.4)',
                  backgroundColor: isOnline
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  color: isOnline ? '#34d399' : '#f87171',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: isOnline ? '#34d399' : '#f87171',
                  boxShadow: isOnline ? '0 0 8px #34d399' : '0 0 8px #f87171'
                }} />
                {isOnline ? 'ONLINE (Disponível)' : 'OFFLINE (Indisponível)'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sub-abas do Entregador */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setAbaInterna('DISPONIVEIS')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease',
              border: abaInterna === 'DISPONIVEIS' ? '2px solid #a855f7' : '1px solid var(--border-color)',
              backgroundColor: abaInterna === 'DISPONIVEIS' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-card)',
              color: abaInterna === 'DISPONIVEIS' ? '#c084fc' : 'var(--text-secondary)'
            }}
          >
            <Package size={16} /> Pedidos para Aceitar ({disponiveisParaEntrega.length})
          </button>

          <button
            onClick={() => setAbaInterna('MINHAS_ENTREGAS')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease',
              border: abaInterna === 'MINHAS_ENTREGAS' ? '2px solid #10b981' : '1px solid var(--border-color)',
              backgroundColor: abaInterna === 'MINHAS_ENTREGAS' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
              color: abaInterna === 'MINHAS_ENTREGAS' ? '#34d399' : 'var(--text-secondary)'
            }}
          >
            <Truck size={16} /> Minhas Entregas & Histórico ({minhasEntregasEmAndamento.length + minhasEntregasConcluidas.length})
          </button>
        </div>

        <button onClick={carregarDados} className="btn-secondary" title="Atualizar dados">
          <RefreshCw size={16} className={carregando ? 'spin' : ''} />
        </button>
      </div>

      {erro && (
        <div style={{ backgroundColor: 'rgba(211,1,1,0.12)', border: '1px solid rgba(211,1,1,0.35)', color: '#f87171', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} /> {erro}
        </div>
      )}

      {/* Conteúdo: Pedidos Disponíveis para Aceitar */}
      {abaInterna === 'DISPONIVEIS' && (
        <div>
          {carregando ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>Carregando pedidos prontos para entrega...</div>
          ) : disponiveisParaEntrega.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <Package size={40} color="var(--text-secondary)" style={{ marginBottom: '12px', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>Nenhum pedido no status "Pronto para Entrega"</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Aguarde os pedidos serem preparados pela cozinha.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {disponiveisParaEntrega.map(p => (
                <div key={p.id} className="glass-panel" style={{ borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-word' }}>
                        Pedido #{p.codigo || p.id}
                      </span>
                      <div style={{ fontSize: '0.78rem', color: '#22d3ee', fontWeight: 600, marginTop: '2px' }}>
                        📦 Pronto para Coleta
                      </div>
                    </div>
                    <span className={`status-badge status-${p.status}`} style={{ flexShrink: 0, maxWidth: '100%' }}>
                      {labelStatus(p.status)}
                    </span>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{p.nomeCliente}</div>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0, color: '#a855f7' }} />
                      <span>{p.enderecoEntrega}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
                      R$ {Number(p.valorTotal || 0).toFixed(2)}
                    </span>

                    <button
                      onClick={() => aoPegarPedido(p)}
                      disabled={processandoId === p.id || !isOnline}
                      title={!isOnline ? 'Fique online para aceitar este pedido' : 'Pegar pedido para transporte'}
                      className="btn-primary"
                      style={{
                        backgroundColor: isOnline ? '#a855f7' : 'var(--border-color)',
                        opacity: isOnline ? 1 : 0.6,
                        cursor: isOnline ? 'pointer' : 'not-allowed',
                        padding: '8px 14px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <ArrowRight size={16} />
                      {processandoId === p.id ? 'Atribuindo...' : 'Pegar Pedido'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo: Histórico de Entregas do Entregador */}
      {abaInterna === 'MINHAS_ENTREGAS' && (
        <div>
          {minhasEntregasEmAndamento.length === 0 && minhasEntregasConcluidas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <Truck size={40} color="var(--text-secondary)" style={{ marginBottom: '12px', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>Nenhum histórico de entregas registrado</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Acesse a aba "Pedidos para Aceitar" para realizar a sua primeira entrega.</p>
            </div>
          ) : (
            <>
              {/* Seção: Em Rota de Entrega */}
              {minhasEntregasEmAndamento.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} color="#10b981" /> Entregas Atuais em Rota ({minhasEntregasEmAndamento.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                    {minhasEntregasEmAndamento.map(p => (
                      <div key={p.id} className="glass-panel" style={{ borderRadius: '14px', padding: '20px', borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '120px' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-word' }}>
                              Pedido #{p.codigo || p.id}
                            </span>
                            <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
                              🛵 Em rota de entrega
                            </div>
                          </div>
                          <span className="status-badge status-SAIU_PARA_ENTREGA" style={{ flexShrink: 0, maxWidth: '100%' }}>
                            Em Trânsito
                          </span>
                        </div>

                        <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{p.nomeCliente}</div>
                          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0, color: '#10b981' }} />
                            <span>{p.enderecoEntrega}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
                            R$ {Number(p.valorTotal || 0).toFixed(2)}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setPedidoParaCancelar(p)}
                              title="Cancelar entrega em andamento"
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#f87171',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'}
                            >
                              <XCircle size={15} /> Cancelar
                            </button>

                            <button
                              onClick={() => aoConcluirEntrega(p.id)}
                              disabled={processandoId === p.id}
                              className="btn-primary"
                              style={{ backgroundColor: '#10b981', padding: '8px 14px', fontSize: '0.85rem' }}
                            >
                              <CheckCircle2 size={16} />
                              {processandoId === p.id ? 'Finalizando...' : 'Marcar Entregue'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção: Histórico de Entregas Concluídas */}
              {minhasEntregasConcluidas.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#10b981" /> Histórico de Entregas Realizadas ({minhasEntregasConcluidas.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                    {minhasEntregasConcluidas.map(p => (
                      <div key={p.id} style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                          <span>Pedido #{p.codigo || p.id}</span>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>R$ {Number(p.valorTotal || 0).toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {p.nomeCliente} — {p.enderecoEntrega}
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> Entrega Concluída com Sucesso
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Paginação */}
      <PaginationControls
        paginaAtual={0}
        totalPaginas={1}
        totalElementos={pedidos.length}
        tamanhoPagina={100}
        aoMudarPagina={() => {}}
        aoMudarTamanho={() => {}}
      />

      {/* Modal de Cancelamento de Pedido pelo Entregador */}
      {pedidoParaCancelar && (
        <CancelOrderModal
          pedido={pedidoParaCancelar}
          aoFechar={() => setPedidoParaCancelar(null)}
          aoCancelarComSucesso={() => {
            setPedidoParaCancelar(null);
            carregarDados();
          }}
        />
      )}
    </div>
  );
}
