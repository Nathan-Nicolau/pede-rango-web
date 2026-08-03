import React, { useState } from 'react';
import { servicoPedidos } from '../services/api';
import { X, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { MOTIVO_CANCELAMENTO_LABELS } from '../utils/statusLabels';

// Motivos permitidos apenas para o perfil CLIENTE (visão do cliente na web)
const MOTIVOS_CLIENTE = ['DESISTENCIA_CLIENTE', 'ATRASO_NA_ENTREGA', 'OUTRO'];

export function CancelOrderModal({ pedido, aoFechar, aoCancelarComSucesso, usuario }) {
  const isCliente = usuario?.perfil === 'CLIENTE';
  const [motivo, definirMotivo] = useState('DESISTENCIA_CLIENTE');
  const [observacoes, definirObservacoes] = useState('');
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  if (!pedido) return null;

  const codigoExibicao = pedido.codigo || pedido.id;

  const aoSubmeter = async (e) => {
    e.preventDefault();
    definirErro(null);

    if (!motivo) {
      definirErro('Selecione o motivo do cancelamento.');
      return;
    }

    if (!observacoes.trim()) {
      definirErro('Informe as observações explicativas sobre o cancelamento (obrigatório).');
      return;
    }

    definirCarregando(true);

    try {
      const pedidoCancelado = await servicoPedidos.cancelarPedido(codigoExibicao, motivo, observacoes.trim());
      aoCancelarComSucesso(pedidoCancelado);
      aoFechar();
    } catch (err) {
      definirErro(err.message || 'Erro ao cancelar pedido.');
    } finally {
      definirCarregando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={aoFechar} style={{ padding: '20px' }}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
          gap: '16px',
          marginBottom: '22px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
            <XCircle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
            <span>Solicitar Cancelamento do Pedido #{codigoExibicao}</span>
          </h3>
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
              marginLeft: 'auto',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--primary-accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerta informativo sobre a entidade CancelamentoPedido */}
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '14px 18px',
          borderRadius: '12px',
          fontSize: '0.88rem',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Atenção:</strong> O cancelamento é uma ação definitiva. As informações fornecidas abaixo serão registradas no histórico de cancelamentos do sistema.
          </div>
        </div>

        {erro && (
          <div style={{ backgroundColor: 'rgba(211, 1, 1, 0.15)', border: '1px solid rgba(211, 1, 1, 0.4)', color: '#f87171', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
            {erro}
          </div>
        )}

        <form onSubmit={aoSubmeter}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="cancel-motivo">Motivo do Cancelamento *</label>
            <select
              id="cancel-motivo"
              className="form-input"
              value={motivo}
              onChange={(e) => definirMotivo(e.target.value)}
              required
            >
              {Object.entries(MOTIVO_CANCELAMENTO_LABELS)
                .filter(([value]) => !isCliente || MOTIVOS_CLIENTE.includes(value))
                .map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label htmlFor="cancel-obs">Observações Explicativas (Obrigatório) *</label>
            <textarea
              id="cancel-obs"
              className="form-input"
              rows={4}
              placeholder="Descreva obrigatoriamente os detalhes e o motivo pelo qual o pedido está sendo cancelado..."
              value={observacoes}
              onChange={(e) => definirObservacoes(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={aoFechar} style={{ minWidth: '120px' }}>
              Voltar
            </button>
            <button type="submit" className="btn-danger" disabled={carregando} style={{ minWidth: '180px', fontWeight: 700, backgroundColor: '#D30101' }}>
              {carregando ? 'Registrando...' : 'Confirmar Cancelamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
