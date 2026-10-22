import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main, #0f172a)',
          color: 'var(--text-main, #f8fafc)',
          padding: '20px',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: 'var(--bg-card, #1e293b)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#f87171'
            }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px 0' }}>
              Algo inesperado aconteceu
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Ocorreu uma falha temporária na interface. Clique no botão abaixo para restaurar a navegação.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#D30101',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              <RefreshCw size={16} /> Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
