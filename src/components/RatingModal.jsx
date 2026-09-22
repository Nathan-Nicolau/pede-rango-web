import React, { useState } from 'react';
import { servicoAvaliacoes } from '../services/api';
import { Star, X, AlertTriangle, CheckCircle2, MessageSquare } from 'lucide-react';

export function RatingModal({ pedido, aoFechar, aoAvaliarComSucesso }) {
  const [nota, setNota] = useState(5);
  const [notaHover, setNotaHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const codigo = pedido.codigo || pedido.id;

  const aoSubmeter = async (e) => {
    e.preventDefault();
    if (!nota || nota < 1 || nota > 5) {
      setErro('Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const avaliacaoCriada = await servicoAvaliacoes.avaliarPedido(codigo, nota, comentario.trim());
      if (aoAvaliarComSucesso) {
        aoAvaliarComSucesso(avaliacaoCriada);
      }
      aoFechar();
    } catch (err) {
      setErro(err.message || 'Erro ao registrar avaliação.');
    } finally {
      setCarregando(false);
    }
  };

  const getTextoNota = (valor) => {
    switch (valor) {
      case 1: return 'Muito Ruim 😞';
      case 2: return 'Ruim 🙁';
      case 3: return 'Regular 😐';
      case 4: return 'Muito Bom 😊';
      case 5: return 'Excelente! 🤩';
      default: return '';
    }
  };

  return (
    <div className="modal-overlay" onClick={aoFechar} style={{ padding: '16px' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '28px' }}>
        
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Avaliar Pedido #{codigo}
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Conte-nos como foi sua experiência gastronômica e de entrega
            </span>
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
              transition: 'all 0.2s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {erro && (
          <div style={{ backgroundColor: 'rgba(211,1,1,0.12)', border: '1px solid rgba(211,1,1,0.35)', color: '#f87171', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {erro}
          </div>
        )}

        <form onSubmit={aoSubmeter} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Seletor de Estrelas Interativo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-input)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Qual a sua nota para este pedido?
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((estrela) => {
                const ativo = (notaHover || nota) >= estrela;
                return (
                  <button
                    key={estrela}
                    type="button"
                    onClick={() => setNota(estrela)}
                    onMouseEnter={() => setNotaHover(estrela)}
                    onMouseLeave={() => setNotaHover(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      transition: 'transform 0.15s ease',
                      transform: (notaHover || nota) === estrela ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    <Star
                      size={32}
                      color={ativo ? '#fbbf24' : 'var(--border-color)'}
                      fill={ativo ? '#fbbf24' : 'none'}
                    />
                  </button>
                );
              })}
            </div>

            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24', minHeight: '22px' }}>
              {getTextoNota(notaHover || nota)}
            </span>
          </div>

          {/* Campo de Comentário Opcional */}
          <div className="form-group">
            <label htmlFor="avaliacao-comentario" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={15} color="var(--primary-accent)" /> Comentário ou Elogio (Opcional)
            </label>
            <textarea
              id="avaliacao-comentario"
              className="form-input"
              rows={3}
              placeholder="Ex: A comida chegou super quente e o entregador foi muito educado!"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn-secondary" onClick={aoFechar} style={{ minWidth: '100px' }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={carregando} style={{ minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> {carregando ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
