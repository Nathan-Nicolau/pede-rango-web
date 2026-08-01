import React, { useState } from 'react';
import { authService } from '../services/api';
import { Utensils, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export function AuthModal({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authService.login(email, password);
        onAuthSuccess(res);
      } else {
        const res = await authService.register(name, email, password);
        onAuthSuccess(res);
      }
    } catch (err) {
      setError(err.message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px', padding: '36px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            padding: '14px',
            borderRadius: '16px',
            marginBottom: '16px',
            boxShadow: '0 8px 20px rgba(249, 115, 22, 0.3)'
          }}>
            <Utensils color="#ffffff" size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px 0' }}>
            {isLogin ? 'Bem-vindo de volta!' : 'Criar Conta'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {isLogin ? 'Acesse o sistema de pedidos com sua conta' : 'Cadastre-se para gerenciar seus pedidos'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: '#0f172a',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: isLogin ? '#1e293b' : 'transparent',
              color: isLogin ? 'var(--primary-accent)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <LogIn size={16} /> Entrar
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: !isLogin ? '#1e293b' : 'transparent',
              color: !isLogin ? 'var(--primary-accent)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <UserPlus size={16} /> Cadastrar
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '0.875rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="auth-name">Nome Completo</label>
              <input
                id="auth-name"
                type="text"
                className="form-input"
                placeholder="Ex: Nathan Nicolau"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">E-mail</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="auth-password">Senha</label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          >
            {loading ? 'Processando...' : isLogin ? 'Entrar no Sistema' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
