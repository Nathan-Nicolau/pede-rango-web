import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PaginationControls({
  paginaAtual = 0,
  totalPaginas = 1,
  totalElementos = 0,
  tamanhoPagina = 10,
  aoMudarPagina,
  aoMudarTamanho
}) {
  const paginasValidas = Math.max(totalPaginas, 1);
  const temAnterior = paginaAtual > 0;
  const temProximo = paginaAtual < paginasValidas - 1;

  return (
    <div
      className="pagination-controls-wrapper"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '16px',
        marginTop: '28px',
        padding: '12px 0',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Controles de Navegação de Páginas (Canto Inferior Direito) */}
      <div
        className="pagination-controls-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '8px 16px',
          borderRadius: '14px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          boxSizing: 'border-box',
          maxWidth: '100%'
        }}
      >
        {aoMudarTamanho && (
          <div className="pagination-per-page" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Por página:</span>
            <select
              value={tamanhoPagina}
              onChange={(e) => aoMudarTamanho(Number(e.target.value))}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <button
          type="button"
          className="pagination-btn pagination-prev-btn"
          onClick={() => temAnterior && aoMudarPagina(paginaAtual - 1)}
          disabled={!temAnterior}
          title="Página Anterior"
          aria-label="Página Anterior"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '9px',
            backgroundColor: temAnterior ? 'var(--bg-input)' : 'transparent',
            border: `1px solid ${temAnterior ? 'var(--border-color)' : 'transparent'}`,
            color: temAnterior ? 'var(--text-main)' : 'var(--text-secondary)',
            cursor: temAnterior ? 'pointer' : 'not-allowed',
            opacity: temAnterior ? 1 : 0.45,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { if (temAnterior) e.currentTarget.style.borderColor = 'var(--primary-accent)'; }}
          onMouseLeave={e => { if (temAnterior) e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <ChevronLeft size={18} />
        </button>

        <span
          className="pagination-page-indicator"
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            padding: '5px 12px',
            backgroundColor: 'var(--bg-input)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            minWidth: '90px',
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}
        >
          Página {paginaAtual + 1} de {paginasValidas}
        </span>

        <button
          type="button"
          className="pagination-btn pagination-next-btn"
          onClick={() => temProximo && aoMudarPagina(paginaAtual + 1)}
          disabled={!temProximo}
          title="Próxima Página"
          aria-label="Próxima Página"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '9px',
            backgroundColor: temProximo ? 'var(--bg-input)' : 'transparent',
            border: `1px solid ${temProximo ? 'var(--border-color)' : 'transparent'}`,
            color: temProximo ? 'var(--text-main)' : 'var(--text-secondary)',
            cursor: temProximo ? 'pointer' : 'not-allowed',
            opacity: temProximo ? 1 : 0.45,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { if (temProximo) e.currentTarget.style.borderColor = 'var(--primary-accent)'; }}
          onMouseLeave={e => { if (temProximo) e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
