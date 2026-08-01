import React, { useState } from 'react';
import { servicoAutenticacao } from '../services/api';
import { Utensils, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export function AuthModal({ aoAutenticarComSucesso }) {
  const [ehModoLogin, definirEhModoLogin] = useState(true);
  const [nome, definirNome] = useState('');
  const [email, definirEmail] = useState('');
  const [senha, definirSenha] = useState('');
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  const aoSubmeter = async (e) => {
    e.preventDefault();
    definirErro(null);
    definirCarregando(true);

    try {
      if (ehModoLogin) {
        const resposta = await servicoAutenticacao.entrar(email, senha);
        aoAutenticarComSucesso(resposta);
      } else {
        const resposta = await servicoAutenticacao.cadastrar(nome, email, senha);
        aoAutenticarComSucesso(resposta);
      }
    } catch (err) {
      definirErro(err.message || 'Falha na autenticação');
    } finally {
      definirCarregando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px', padding: '36px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, #D30101 0%, #9e0000 100%)',
            padding: '14px',
            borderRadius: '16px',
            marginBottom: '16px',
            boxShadow: '0 8px 20px rgba(211, 1, 1, 0.3)'
          }}>
            <Utensils color="#ffffff" size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px 0' }}>
            {ehModoLogin ? 'Bem-vindo de volta!' : 'Criar Conta'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {ehModoLogin ? 'Acesse o sistema de pedidos com sua conta' : 'Cadastre-se para gerenciar seus pedidos'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: '#141417',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { definirEhModoLogin(true); definirErro(null); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: ehModoLogin ? '#26262d' : 'transparent',
              color: ehModoLogin ? 'var(--primary-accent)' : 'var(--text-secondary)',
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
            onClick={() => { definirEhModoLogin(false); definirErro(null); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: !ehModoLogin ? '#26262d' : 'transparent',
              color: !ehModoLogin ? 'var(--primary-accent)' : 'var(--text-secondary)',
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

        {erro && (
          <div style={{
            backgroundColor: 'rgba(211, 1, 1, 0.15)',
            border: '1px solid rgba(211, 1, 1, 0.4)',
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
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={aoSubmeter}>
          {!ehModoLogin && (
            <div className="form-group">
              <label htmlFor="auth-name">Nome Completo</label>
              <input
                id="auth-name"
                type="text"
                className="form-input"
                placeholder="Ex: Nathan Nicolau"
                value={nome}
                onChange={(e) => definirNome(e.target.value)}
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
              onChange={(e) => definirEmail(e.target.value)}
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
              value={senha}
              onChange={(e) => definirSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={carregando}
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          >
            {carregando ? 'Processando...' : ehModoLogin ? 'Entrar no Sistema' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
