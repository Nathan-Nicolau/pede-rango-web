import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

export function LogoutModal({ aoFechar, aoConfirmarSair }) {
  return (
    <div className="modal-overlay" onClick={aoFechar} style={{ padding: '16px' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '32px 28px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid rgba(211, 1, 1, 0.3)',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 25px rgba(211, 1, 1, 0.2)',
          position: 'relative'
        }}
      >
        {/* Botão Fechar no canto superior */}
        <button
          onClick={aoFechar}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <X size={20} />
        </button>

        {/* Ícone de Destaque / Alerta */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(211, 1, 1, 0.15)',
            border: '2px solid rgba(211, 1, 1, 0.4)',
            color: 'var(--primary-accent)',
            marginBottom: '20px',
            boxShadow: '0 0 20px rgba(211, 1, 1, 0.25)'
          }}
        >
          <LogOut size={30} style={{ marginLeft: '-2px' }} />
        </div>

        {/* Título & Descrição */}
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          Deseja realmente sair?
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '28px' }}>
          Sua sessão atual será encerrada. Você precisará informar suas credenciais novamente para acessar o sistema.
        </p>

        {/* Ações */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={aoFechar}
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.95rem'
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={aoConfirmarSair}
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #D30101 0%, #a80000 100%)'
            }}
          >
            <LogOut size={16} /> Sim, Sair
          </button>
        </div>
      </div>
    </div>
  );
}
