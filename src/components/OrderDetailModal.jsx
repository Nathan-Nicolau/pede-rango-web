import { labelStatus, obterOpcoesStatusProximos, podeAlterarStatusPedido, podeCancelarPedido, formatarDataHora, labelMotivoCancelamento, labelFormaPagamento } from '../utils/statusLabels';
import { X, XCircle, Clock, MapPin, User, Package, PackageCheck, CheckCircle2, AlertTriangle, FileText, Banknote, CreditCard, QrCode, Phone, MessageSquare, RotateCcw, Truck, UtensilsCrossed, Printer, Check, Star } from 'lucide-react';
import { abrirWhatsapp } from '../utils/whatsapp';
import { imprimirComanda } from '../utils/imprimirComanda';
import { RatingModal } from './RatingModal';
import { calcularJanelaEntrega, calcularProgressoEntrega } from '../utils/tempoEstimado';
import React, { useState } from 'react';

const ETAPAS_PEDIDO = [
  { status: 'RECEBIDO', label: 'Recebido', Icone: Clock },
  { status: 'EM_PREPARO', label: 'Na Cozinha', Icone: UtensilsCrossed },
  { status: 'PRONTO_PARA_ENTREGA', label: 'Pronto', Icone: PackageCheck },
  { status: 'SAIU_PARA_ENTREGA', label: 'A Caminho', Icone: Truck },
  { status: 'ENTREGUE', label: 'Entregue', Icone: CheckCircle2 },
];

export function OrderDetailModal({ pedido, usuario, configuracao, aoFechar, aoAtualizarStatus, aoRepetirPedido, aoCancelarPedido }) {
  if (!pedido) return null;

  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);
  const [avaliacaoLocal, setAvaliacaoLocal] = useState(pedido.avaliacao || null);

  const perfil = usuario?.perfil || 'CLIENTE';
  const podeAlterar = podeAlterarStatusPedido(pedido, perfil);
  const podeCancelar = podeCancelarPedido(pedido, perfil);
  const opcoesProximas = obterOpcoesStatusProximos(pedido.status, perfil);

  const tempoMin = Number(configuracao?.tempoEstimadoMinMinutos || 30);
  const tempoMax = Number(configuracao?.tempoEstimadoMaxMinutos || 45);
  const janelaEntrega = calcularJanelaEntrega(pedido.criadoEm || pedido.createdAt, tempoMin, tempoMax);
  const progressoEntrega = calcularProgressoEntrega(pedido.criadoEm || pedido.createdAt, tempoMax);

  const listaItens = pedido.itens || pedido.items || [];
  const valorTotal = Number(pedido.valorTotal ?? pedido.totalAmount ?? 0).toFixed(2);
  const taxaEntrega = Number(pedido.taxaEntrega ?? 0);
  const subtotalItens = listaItens.reduce((acc, item) => {
    const qtd = item.quantidade ?? item.quantity ?? 1;
    const preco = item.precoUnitario ?? item.unitPrice ?? 0;
    return acc + (qtd * preco);
  }, 0);

  const clienteNome = pedido.nomeCliente || pedido.customerName || 'Cliente sem nome';
  const telefoneCliente = pedido.telefoneCliente || pedido.clienteTelefone || pedido.telefone;
  const telefoneEntregador = pedido.telefoneEntregador || pedido.entregadorTelefone;
  const entregadorNome = pedido.nomeEntregador || pedido.entregadorNome;

  const enderecoEntrega = pedido.enderecoEntrega || pedido.deliveryAddress || 'Endereço não informado';
  const codigoExibicao = pedido.codigo || pedido.id;
  const dataCriacao = pedido.criadoEm || pedido.createdAt;
  const dataEntrega = pedido.dataEntrega || pedido.deliveredAt;
  const formaPagamento = pedido.formaPagamento || 'DINHEIRO';
  const trocoPara = pedido.trocoPara ? Number(pedido.trocoPara) : null;

  const indiceStatusAtual = ETAPAS_PEDIDO.findIndex(e => e.status === pedido.status);

  const renderIconePagamento = (forma) => {
    switch (forma) {
      case 'PIX': return <QrCode size={16} color="#06b6d4" />;
      case 'CARTAO_CREDITO':
      case 'CARTAO_DEBITO': return <CreditCard size={16} color="#3b82f6" />;
      default: return <Banknote size={16} color="#10b981" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={aoFechar} style={{ padding: '16px' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '100%', padding: '28px' }}>
        {/* Cabeçalho com Alinhamento Perfeito */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(perfil === 'ADMIN' || perfil === 'RESTAURANTE') && (
              <button
                type="button"
                onClick={() => imprimirComanda(pedido)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Imprimir comanda de cozinha"
              >
                <Printer size={15} /> Imprimir Comanda
              </button>
            )}

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
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--primary-accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Linha do Tempo / Stepper Visual de Progresso */}
        {pedido.status !== 'CANCELADO' && (
          <div style={{
            backgroundColor: 'var(--bg-input)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '20px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Progresso do Pedido
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', width: '100%' }}>
              {ETAPAS_PEDIDO.map((etapa, idx) => {
                const concluido = idx <= indiceStatusAtual;
                const atual = idx === indiceStatusAtual;
                const { Icone, label } = etapa;

                return (
                  <div key={etapa.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                    {/* Linha de conexão entre etapas */}
                    {idx > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '16px',
                          left: '-50%',
                          width: '100%',
                          height: '3px',
                          backgroundColor: idx <= indiceStatusAtual ? 'var(--primary-accent)' : 'var(--border-color)',
                          zIndex: 0,
                          transition: 'background-color 0.3s ease'
                        }}
                      />
                    )}

                    {/* Círculo do Ícone */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: atual
                          ? 'var(--primary-accent)'
                          : concluido
                          ? 'rgba(211, 1, 1, 0.2)'
                          : 'var(--bg-card)',
                        border: atual
                          ? '2px solid #fff'
                          : concluido
                          ? '2px solid var(--primary-accent)'
                          : '2px solid var(--border-color)',
                        color: atual ? '#fff' : concluido ? 'var(--primary-accent)' : 'var(--text-secondary)',
                        boxShadow: atual ? '0 0 12px rgba(211, 1, 1, 0.5)' : 'none',
                        position: 'relative',
                        zIndex: 2,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {concluido && !atual ? (
                        <Check size={16} />
                      ) : (
                        <Icone size={15} />
                      )}
                    </div>

                    {/* Rótulo da Etapa */}
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: atual ? 700 : 500,
                      color: atual ? 'var(--text-main)' : concluido ? 'var(--text-main)' : 'var(--text-secondary)',
                      marginTop: '6px',
                      textAlign: 'center'
                    }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Previsão Dinâmica de Entrega (para pedidos em andamento) */}
        {['RECEBIDO', 'EM_PREPARO', 'PRONTO_PARA_ENTREGA', 'SAIU_PARA_ENTREGA'].includes(pedido.status) && (
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 600, fontSize: '0.88rem' }}>
              <Clock size={16} /> Previsão de Entrega: <strong style={{ color: '#93c5fd' }}>{janelaEntrega.janelaHorario}</strong> ({janelaEntrega.tempoEstimadoMinutos})
            </div>
            {progressoEntrega && (
              <span style={{ fontSize: '0.78rem', color: progressoEntrega.atrasado ? '#f87171' : '#34d399', fontWeight: 600 }}>
                {progressoEntrega.atrasado
                  ? `⚠️ Decorridos ${progressoEntrega.minutosDecorridos} min`
                  : `⏳ Decorridos ${progressoEntrega.minutosDecorridos} min (${progressoEntrega.minutosRestantes} min restantes)`}
              </span>
            )}
          </div>
        )}

        {/* Bloco de Avaliação do Pedido (quando entregue) */}
        {pedido.status === 'ENTREGUE' && (
          <div style={{
            backgroundColor: 'rgba(251, 191, 36, 0.08)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', padding: '6px', borderRadius: '8px' }}>
                <Star size={20} color="#fbbf24" fill="#fbbf24" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24' }}>
                  {avaliacaoLocal ? `Avaliação do Cliente: ${avaliacaoLocal.nota}/5 Estrelas ⭐` : 'Avaliação do Pedido'}
                </div>
                {avaliacaoLocal ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    {avaliacaoLocal.comentario ? `"${avaliacaoLocal.comentario}"` : 'Sem comentário adicional.'}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Como foi sua experiência com este pedido?
                  </div>
                )}
              </div>
            </div>

            {!avaliacaoLocal && perfil === 'CLIENTE' && (
              <button
                type="button"
                onClick={() => setModalAvaliacaoAberto(true)}
                className="btn-primary"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  backgroundColor: '#fbbf24',
                  borderColor: '#f59e0b',
                  color: '#ffffff',
                  fontWeight: 700
                }}
              >
                ⭐ Avaliar Pedido
              </button>
            )}
          </div>
        )}

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

        {/* Dados do Cliente, Endereço e Forma de Pagamento */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
            {perfil !== 'CLIENTE' && telefoneCliente ? (
              <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => abrirWhatsapp(telefoneCliente, `Olá ${clienteNome}, falo sobre seu pedido #${codigoExibicao} no Pede Rango.`)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(37, 211, 102, 0.15)',
                    border: '1px solid rgba(37, 211, 102, 0.4)',
                    color: '#25D366',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Chamar no WhatsApp"
                >
                  <MessageSquare size={12} /> {telefoneCliente}
                </button>
              </div>
            ) : telefoneCliente ? (
              <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> {telefoneCliente}
              </div>
            ) : null}
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              Endereço de Entrega
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} color="var(--text-secondary)" /> {enderecoEntrega}
            </div>
            {entregadorNome && (
              <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={13} color="#a855f7" /> Entregador: <strong style={{ color: 'var(--text-main)' }}>{entregadorNome}</strong>
                {telefoneEntregador && (
                  <button
                    type="button"
                    onClick={() => abrirWhatsapp(telefoneEntregador, `Olá ${entregadorNome}, sobre a entrega do pedido #${codigoExibicao}.`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#25D366',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Chamar entregador no WhatsApp"
                  >
                    <MessageSquare size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
              Pagamento (na entrega)
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              {renderIconePagamento(formaPagamento)}
              <span>{labelFormaPagamento(formaPagamento)}</span>
            </div>
            {formaPagamento === 'DINHEIRO' && trocoPara && (
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
                Troco p/ R$ {trocoPara.toFixed(2)} (Devolver: R$ {(trocoPara - Number(valorTotal)).toFixed(2)})
              </div>
            )}
          </div>
        </div>

        {/* Seção de Ações / Troca de Status e Cancelamento */}
        {perfil !== 'CLIENTE' ? (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                Avançar Status do Pedido:
              </label>
              {podeCancelar && (
                <button
                  type="button"
                  onClick={() => {
                    aoFechar();
                    aoCancelarPedido && aoCancelarPedido(pedido);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <XCircle size={14} /> Cancelar Pedido
                </button>
              )}
            </div>
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
            ) : perfil === 'RESTAURANTE' && pedido.status === 'PRONTO_PARA_ENTREGA' ? (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                color: '#22d3ee',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <PackageCheck size={18} /> Pedido pronto no balcão — aguardando entregador iniciar a rota de entrega.
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
                🔒 O status ({labelStatus(pedido.status)}) não pode ser alterado por este perfil.
              </div>
            )}
          </div>
        ) : (
          /* Visão do CLIENTE */
          <div style={{ marginBottom: '24px' }}>
            {pedido.status === 'RECEBIDO' && podeCancelar ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-input)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  A cozinha ainda não iniciou o preparo. Deseja cancelar?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    aoFechar();
                    aoCancelarPedido && aoCancelarPedido(pedido);
                  }}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <XCircle size={14} /> Cancelar Pedido
                </button>
              </div>
            ) : ['EM_PREPARO', 'PRONTO_PARA_ENTREGA', 'SAIU_PARA_ENTREGA'].includes(pedido.status) ? (
              <div style={{
                backgroundColor: 'var(--bg-input)',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  🍽️ Pedido já em produção/rota. Dúvidas ou cancelamento?
                </span>
                {configuracao?.telefoneContato && (
                  <button
                    type="button"
                    onClick={() => abrirWhatsapp(configuracao.telefoneContato, `Olá! Sou ${clienteNome}, sobre meu pedido #${codigoExibicao}.`)}
                    style={{
                      backgroundColor: 'rgba(37, 211, 102, 0.15)',
                      border: '1px solid rgba(37, 211, 102, 0.4)',
                      color: '#25D366',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    title="Falar com o restaurante no WhatsApp"
                  >
                    <MessageSquare size={14} /> Falar com o Restaurante
                  </button>
                )}
              </div>
            ) : null}
          </div>
        )}

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
                  const obs = item.observacao || item.observation;

                  return (
                    <tr key={item.id || i} style={{ borderBottom: i < listaItens.length - 1 ? '1px solid var(--border-color)' : 'none', color: 'var(--text-main)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                        <div>{nome}</div>
                        {obs && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--primary-accent)', fontWeight: 500, marginTop: '2px' }}>
                            Obs: "{obs}"
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{qtd}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>R$ {Number(precoUnitario).toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--primary-accent)' }}>
                        R$ {Number(subtotal).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {taxaEntrega > 0 && (
                  <>
                    <tr style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card-hover)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <td colSpan={3} style={{ padding: '8px 16px', textAlign: 'right' }}>Subtotal dos Itens:</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>R$ {subtotalItens.toFixed(2)}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--bg-card-hover)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <td colSpan={3} style={{ padding: '8px 16px', textAlign: 'right' }}>🛵 Taxa de Entrega:</td>
                      <td style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 600, color: '#34d399' }}>+ R$ {taxaEntrega.toFixed(2)}</td>
                    </tr>
                  </>
                )}
              </tfoot>
            </table>
          </div>
        </div>

        {/* Rodapé com Valor Total e Botão de Repetir Pedido para Cliente */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {perfil === 'CLIENTE' && (pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO') && aoRepetirPedido && (
            <button
              type="button"
              onClick={() => {
                aoFechar();
                aoRepetirPedido(pedido);
              }}
              className="btn-primary"
              style={{
                backgroundColor: 'rgba(211, 1, 1, 0.15)',
                border: '1px solid var(--primary-accent)',
                color: "#ffffff",
                padding: '8px 16px',
                fontSize: '0.85rem'
              }}
            >
              <RotateCcw size={16} /> Repetir este Pedido
            </button>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Valor Total:
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
              R$ {valorTotal}
            </span>
          </div>
        </div>
      </div>

      {modalAvaliacaoAberto && (
        <RatingModal
          pedido={pedido}
          aoFechar={() => setModalAvaliacaoAberto(false)}
          aoAvaliarComSucesso={(novaAvaliacao) => {
            setAvaliacaoLocal(novaAvaliacao);
          }}
        />
      )}
    </div>
  );
}
