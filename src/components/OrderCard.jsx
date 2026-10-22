import { labelStatus, obterOpcoesStatusProximos, podeAlterarStatusPedido, podeCancelarPedido, formatarHora, formatarDataHora, labelMotivoCancelamento, labelFormaPagamento } from '../utils/statusLabels';
import { User, MapPin, Package, Clock, XCircle, PackageCheck, CheckCircle2, AlertTriangle, FileText, Banknote, CreditCard, QrCode, MessageSquare, RotateCcw, Printer, Star } from 'lucide-react';
import { abrirWhatsapp } from '../utils/whatsapp';
import { imprimirComanda } from '../utils/imprimirComanda';
import { calcularJanelaEntrega } from '../utils/tempoEstimado';

export function OrderCard({ pedido, usuario, configuracao, aoClicarCard, aoAtualizarStatus, aoCancelarPedido, aoRepetirPedido }) {
  const perfil = usuario?.perfil || 'CLIENTE';

  const isFinalizado = pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO';
  const estaAberta = Boolean(configuracao?.operacionalmenteAbertaHoje);
  const podeAlterarStatus = podeAlterarStatusPedido(pedido, perfil);
  const podeCancelar = podeCancelarPedido(pedido, perfil);
  const opcoesProximas = obterOpcoesStatusProximos(pedido.status, perfil);

  const aoAlterarStatusSelect = (e) => {
    e.stopPropagation();
    aoAtualizarStatus(pedido.id, e.target.value);
  };

  const listaItens = pedido.itens || pedido.items || [];
  const valorTotal = Number(pedido.valorTotal ?? pedido.totalAmount ?? 0).toFixed(2);
  const taxaEntrega = Number(pedido.taxaEntrega ?? 0);
  const clienteNome = pedido.nomeCliente || pedido.customerName || 'Cliente sem nome';
  const telefoneCliente = pedido.telefoneCliente || pedido.clienteTelefone || pedido.telefone;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {(perfil === 'ADMIN' || perfil === 'RESTAURANTE') && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                imprimirComanda(pedido);
              }}
              title="Imprimir comanda para a cozinha"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--primary-accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <Printer size={13} /> Comanda
            </button>
          )}
          <span className={`status-badge status-${pedido.status}`} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            {pedido.status === 'PRONTO_PARA_ENTREGA' && <PackageCheck size={14} color="#22d3ee" />}
            {labelStatus(pedido.status)}
          </span>
        </div>
      </div>

      {/* Exibição Clara de Datas: Criação, Entrega e Cancelamento */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} color="var(--primary-accent)" />
          <span><strong>Criado em:</strong> {formatarDataHora(dataCriacao)}</span>
        </div>

        {/* Previsão de Entrega Dinâmica para pedidos em andamento */}
        {['RECEBIDO', 'EM_PREPARO', 'PRONTO_PARA_ENTREGA', 'SAIU_PARA_ENTREGA'].includes(pedido.status) && (
          <div style={{
            fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(59,130,246,0.1)', padding: '4px 8px',
            borderRadius: '6px', border: '1px solid rgba(59,130,246,0.3)',
            marginTop: '2px'
          }}>
            <Clock size={12} color="#60a5fa" />
            <span>Previsão: {calcularJanelaEntrega(dataCriacao, Number(configuracao?.tempoEstimadoMinMinutos || 30), Number(configuracao?.tempoEstimadoMaxMinutos || 45)).janelaHorario}</span>
          </div>
        )}

        {/* Data e Status de Entrega */}
        {pedido.status === 'ENTREGUE' && (
          <div style={{
            fontSize: '0.8rem', color: '#34d399', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: 'rgba(16,185,129,0.12)', padding: '6px 10px',
            borderRadius: '8px', border: '1px solid rgba(52,211,153,0.3)',
            marginTop: '2px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#34d399" />
              <span>{dataEntrega ? formatarDataHora(dataEntrega) : 'Entregue'}</span>
            </div>
            {pedido.avaliacao && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#fbbf24', fontSize: '0.76rem', fontWeight: 700 }}>
                <Star size={12} fill="#fbbf24" color="#fbbf24" /> {pedido.avaliacao.nota}/5
              </span>
            )}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-main)', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} color="var(--primary-accent)" />
            <span>{clienteNome}</span>
          </div>
          {perfil !== 'CLIENTE' && telefoneCliente && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                abrirWhatsapp(telefoneCliente, `Olá ${clienteNome}, sobre seu pedido #${codigoExibicao} no Pede Rango.`);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#25D366',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: 'rgba(37, 211, 102, 0.12)'
              }}
              title="Chamar cliente no WhatsApp"
            >
              <MessageSquare size={13} /> WhatsApp
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <MapPin size={16} color="var(--text-secondary)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
            {enderecoEntrega}
          </span>
        </div>
      </div>

      {/* Resumo dos Itens, Pagamento & Total */}
      <div style={{
        backgroundColor: 'var(--bg-input)',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={14} /> {listaItens.length} {listaItens.length === 1 ? 'item' : 'itens'}
            {taxaEntrega > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(+taxa R$ {taxaEntrega.toFixed(2)})</span>}
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-accent)', marginLeft: 'auto' }}>
            R$ {valorTotal}
          </span>
        </div>

        {/* Badge da Forma de Pagamento */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', paddingTop: '4px', borderTop: '1px dashed var(--border-color)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)', fontWeight: 600 }}>
            {pedido.formaPagamento === 'PIX' ? <QrCode size={13} color="#06b6d4" /> :
             pedido.formaPagamento === 'CARTAO_CREDITO' || pedido.formaPagamento === 'CARTAO_DEBITO' ? <CreditCard size={13} color="#3b82f6" /> :
             <Banknote size={13} color="#10b981" />}
            {labelFormaPagamento(pedido.formaPagamento)}
          </span>
          {pedido.formaPagamento === 'DINHEIRO' && pedido.trocoPara && (
            <span style={{ color: '#34d399', fontWeight: 600 }}>
              Troco p/ R$ {Number(pedido.trocoPara).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Ações Específicas por Perfil */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', gap: '10px' }}
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
        ) : perfil === 'CLIENTE' && isFinalizado && aoRepetirPedido ? (
          <button
            type="button"
            disabled={!estaAberta}
            onClick={(e) => {
              e.stopPropagation();
              if (!estaAberta) {
                alert('O estabelecimento está temporariamente fechado para novos pedidos.');
                return;
              }
              aoRepetirPedido(pedido);
            }}
            style={{
              width: '100%',
              backgroundColor: estaAberta ? 'rgba(211, 1, 1, 0.12)' : 'rgba(150, 150, 150, 0.12)',
              border: `1px solid ${estaAberta ? 'var(--primary-accent)' : 'var(--border-color)'}`,
              color: estaAberta ? 'var(--primary-accent)' : 'var(--text-secondary)',
              padding: '8px 12px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: estaAberta ? 'pointer' : 'not-allowed',
              opacity: estaAberta ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (estaAberta) e.currentTarget.style.backgroundColor = 'rgba(211, 1, 1, 0.22)'; }}
            onMouseLeave={e => { if (estaAberta) e.currentTarget.style.backgroundColor = 'rgba(211, 1, 1, 0.12)'; }}
            title={!estaAberta ? 'Estabelecimento fechado para novos pedidos no momento' : 'Fazer um novo pedido com os mesmos itens deste'}
          >
            <RotateCcw size={15} /> Repetir Pedido
          </button>
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
        ) : perfil === 'RESTAURANTE' && pedido.status === 'PRONTO_PARA_ENTREGA' ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#22d3ee', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <PackageCheck size={15} /> Pronto no balcão (Aguardando entregador)
            </span>
            {podeCancelar && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  aoCancelarPedido && aoCancelarPedido(pedido);
                }}
                style={{
                  background: 'none',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        ) : perfil === 'CLIENTE' && !isFinalizado ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {pedido.status === 'SAIU_PARA_ENTREGA' ? '🛵 Pedido a caminho' : '👨‍🍳 Em produção na cozinha'}
            </span>
            {configuracao?.telefoneContato && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  abrirWhatsapp(configuracao.telefoneContato, `Olá! Sou ${clienteNome}, sobre meu pedido #${codigoExibicao}.`);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#25D366',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(37, 211, 102, 0.12)'
                }}
                title="Falar com o restaurante no WhatsApp"
              >
                <MessageSquare size={13} /> Falar com a Loja
              </button>
            )}
          </div>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔒 {isFinalizado ? 'Pedido finalizado' : 'Status fixo'} ({labelStatus(pedido.status)})
          </span>
        )}
      </div>
    </div>
  );
}

