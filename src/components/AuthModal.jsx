import React, { useState, useEffect } from 'react';
import { servicoAutenticacao } from '../services/api';
import { Utensils, LogIn, UserPlus, AlertCircle, ChevronLeft, ChevronRight, Zap, MapPin, ShieldCheck, Clock, Eye, EyeOff } from 'lucide-react';

// Slides do Carrossel com SVGs Customizados no tema Vermelho & Dark
const SLIDES_CARROSSEL = [
  {
    id: 'entrega-rapida',
    titulo: 'Entregas Ágeis & Seguras',
    descricao: 'Conectamos seu restaurante aos clientes com máxima velocidade e confiabilidade a cada pedido.',
    tag: '⚡ Ultra-Rápido',
    renderSvg: () => (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', maxHeight: '240px' }}>
        <defs>
          <linearGradient id="redGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2E2E" />
            <stop offset="100%" stopColor="#9E0000" />
          </linearGradient>
          <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2A32" />
            <stop offset="100%" stopColor="#18181C" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Linhas de Velocidade (Fundo) */}
        <path d="M 30 70 L 150 70" stroke="#D30101" strokeWidth="3" strokeDasharray="8 6" opacity="0.4" />
        <path d="M 10 130 L 120 130" stroke="#D30101" strokeWidth="4" strokeDasharray="12 8" opacity="0.6" />
        <path d="M 40 190 L 160 190" stroke="#D30101" strokeWidth="3" strokeDasharray="6 6" opacity="0.4" />

        {/* Círculo de Destaque / Aurea */}
        <circle cx="230" cy="150" r="95" fill="url(#redGlow)" opacity="0.15" filter="url(#glow)" />
        <circle cx="230" cy="150" r="80" stroke="url(#redGlow)" strokeWidth="2" strokeDasharray="6 6" opacity="0.4" />

        {/* Scooter / Moto de Entrega */}
        <g transform="translate(130, 70)">
          {/* Rodas */}
          <circle cx="45" cy="120" r="24" fill="#141417" stroke="url(#redGlow)" strokeWidth="5" />
          <circle cx="45" cy="120" r="10" fill="#2E2E35" />
          <circle cx="145" cy="120" r="24" fill="#141417" stroke="url(#redGlow)" strokeWidth="5" />
          <circle cx="145" cy="120" r="10" fill="#2E2E35" />

          {/* Chassi da Moto */}
          <path d="M 45 120 L 75 118 L 105 85 L 140 85 L 145 120" stroke="url(#redGlow)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 75 118 L 95 65 L 125 65" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />

          {/* Farol Gled com Brilho */}
          <path d="M 140 80 L 155 78" stroke="#FFE600" strokeWidth="5" strokeLinecap="round" filter="url(#glow)" />
          <polygon points="155,75 220,55 220,105 155,83" fill="#FFE600" opacity="0.15" />

          {/* Baú de Delivery (Vermelho com Ícone) */}
          <rect x="20" y="55" width="45" height="45" rx="8" fill="url(#redGlow)" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M 35 70 L 50 70 M 42.5 62.5 L 42.5 77.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

          {/* Piloto / Entregador */}
          <circle cx="95" cy="45" r="14" fill="#D30101" /> {/* Capacete */}
          <path d="M 98 42 L 107 45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" /> {/* Viseira */}
          <path d="M 80 65 Q 95 60 110 75" stroke="#2A2A32" strokeWidth="12" strokeLinecap="round" /> {/* Jaqueta */}
        </g>
      </svg>
    )
  },
  {
    id: 'restaurantes-variados',
    titulo: 'Cardápio Completo & Diversificado',
    descricao: 'Gerencie itens, categorias e acompanhe a produção de pratos em tempo real no dashboard.',
    tag: '🍲 Alta Gastronomia',
    renderSvg: () => (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', maxHeight: '240px' }}>
        <defs>
          <linearGradient id="redGlow2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D30101" />
            <stop offset="100%" stopColor="#7A0000" />
          </linearGradient>
        </defs>

        {/* Prato Base */}
        <ellipse cx="200" cy="180" rx="120" ry="35" fill="#1C1C20" stroke="#2E2E35" strokeWidth="4" />
        <ellipse cx="200" cy="178" rx="90" ry="24" fill="#121214" stroke="url(#redGlow2)" strokeWidth="2" />

        {/* Cloche / Doma Gourmet */}
        <path d="M 110 170 C 110 90, 290 90, 290 170 Z" fill="url(#redGlow2)" opacity="0.85" />
        <path d="M 130 165 C 130 110, 270 110, 270 165 Z" stroke="#FFFFFF" strokeWidth="2" opacity="0.2" fill="none" />
        
        {/* Puxador da Cloche */}
        <circle cx="200" cy="90" r="14" fill="#FF4D4D" stroke="#FFFFFF" strokeWidth="2" />

        {/* Fumaça / Vapor Aromático */}
        <path d="M 170 70 Q 160 50 175 35" stroke="#FF4D4D" strokeWidth="3" strokeLinecap="round" opacity="0.7" fill="none" />
        <path d="M 200 65 Q 215 45 200 25" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" fill="none" />
        <path d="M 230 70 Q 240 50 225 35" stroke="#FF4D4D" strokeWidth="3" strokeLinecap="round" opacity="0.7" fill="none" />

        {/* Estrelas de Avaliação / Brilho */}
        <polygon points="90,70 93,78 102,78 95,83 97,91 90,86 83,91 85,83 78,78 87,78" fill="#FFE600" />
        <polygon points="310,60 313,68 322,68 315,73 317,81 310,76 303,81 305,73 298,68 307,68" fill="#FFE600" />
      </svg>
    )
  },
  {
    id: 'rastreamento-gps',
    titulo: 'Rastreamento em Tempo Real',
    descricao: 'Monitore o status exato de cada pedido: do recebimento à entrega final.',
    tag: '📍 GPS Vivo',
    renderSvg: () => (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', maxHeight: '240px' }}>
        <defs>
          <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1E24" />
            <stop offset="100%" stopColor="#121215" />
          </linearGradient>
        </defs>

        {/* Smartphone / Tela de Mapa */}
        <rect x="120" y="20" width="160" height="260" rx="24" fill="url(#mapBg)" stroke="#2E2E35" strokeWidth="4" />
        <rect x="132" y="40" width="136" height="215" rx="12" fill="#141418" />

        {/* Grid de Ruas do Mapa */}
        <path d="M 132 100 L 268 100" stroke="#26262E" strokeWidth="8" />
        <path d="M 132 170 L 268 170" stroke="#26262E" strokeWidth="12" />
        <path d="M 180 40 L 180 255" stroke="#26262E" strokeWidth="10" />
        <path d="M 230 40 L 230 255" stroke="#26262E" strokeWidth="6" />

        {/* Rota Tracejada em Vermelho */}
        <path d="M 150 210 Q 180 170 180 120 T 230 75" stroke="#D30101" strokeWidth="4" strokeDasharray="6 4" fill="none" />

        {/* Pin de Destino Pulsante */}
        <circle cx="230" cy="75" r="16" fill="#D30101" opacity="0.3" />
        <circle cx="230" cy="75" r="10" fill="#D30101" />
        <circle cx="230" cy="75" r="4" fill="#FFFFFF" />

        {/* Pin de Origem (Restaurante) */}
        <circle cx="150" cy="210" r="8" fill="#10B981" />
        <circle cx="150" cy="210" r="3" fill="#FFFFFF" />

        {/* Card Flutuante de Status */}
        <rect x="145" y="125" width="110" height="36" rx="8" fill="#1C1C20" stroke="#D30101" strokeWidth="1.5" />
        <text x="155" y="147" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">🛵 Em trânsito (8 min)</text>
      </svg>
    )
  }
];

export function AuthModal({ aoAutenticarComSucesso }) {
  const [ehModoLogin, definirEhModoLogin] = useState(true);
  const [nome, definirNome] = useState('');
  const [email, definirEmail] = useState('');
  const [senha, definirSenha] = useState('');
  const [mostrarSenha, definirMostrarSenha] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  // Estado do Carrossel
  const [indiceSlide, definirIndiceSlide] = useState(0);

  // Auto-rotate slides a cada 4.5 segundos
  useEffect(() => {
    const temporizador = setInterval(() => {
      definirIndiceSlide((prev) => (prev + 1) % SLIDES_CARROSSEL.length);
    }, 4500);
    return () => clearInterval(temporizador);
  }, []);

  const slideAtual = SLIDES_CARROSSEL[indiceSlide];

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

  const proximoSlide = () => {
    definirIndiceSlide((prev) => (prev + 1) % SLIDES_CARROSSEL.length);
  };

  const slideAnterior = () => {
    definirIndiceSlide((prev) => (prev - 1 + SLIDES_CARROSSEL.length) % SLIDES_CARROSSEL.length);
  };

  return (
    <div className="modal-overlay" style={{ padding: '20px' }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '1040px',
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(211, 1, 1, 0.15)'
        }}
      >
        {/* LADO ESQUERDO: Form de Login / Cadastro */}
        <div
          style={{
            padding: '48px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--modal-left-bg)',
            transition: 'background-color 0.3s ease'
          }}
        >
          {/* Header Marca */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                display: 'inline-flex',
                background: 'linear-gradient(135deg, #D30101 0%, #9e0000 100%)',
                padding: '14px',
                borderRadius: '16px',
                marginBottom: '14px',
                boxShadow: '0 8px 24px rgba(211, 1, 1, 0.35)'
              }}
            >
              <Utensils color="#ffffff" size={30} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--title-color)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              {ehModoLogin ? 'Acessar Conta' : 'Criar Nova Conta'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              {ehModoLogin ? 'Gerencie pedidos e acompanhe entregas com agilidade' : 'Cadastre-se para experimentar o melhor em Food Delivery'}
            </p>
          </div>

          {/* Tab Toggle (Entrar / Cadastrar) com Pílula Deslizante */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              backgroundColor: 'var(--tab-bg)',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}
          >
            {/* Pílula Deslizante de Destaque */}
            <div
              style={{
                position: 'absolute',
                top: '4px',
                bottom: '4px',
                left: ehModoLogin ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)',
                background: 'linear-gradient(135deg, #D30101 0%, #9e0000 100%)',
                borderRadius: '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 14px rgba(211, 1, 1, 0.4)',
                zIndex: 1
              }}
            />

            <button
              type="button"
              onClick={() => { definirEhModoLogin(true); definirErro(null); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: ehModoLogin ? '#ffffff' : 'var(--text-secondary)',
                transition: 'color 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                position: 'relative',
                zIndex: 2
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
                fontSize: '0.9rem',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: !ehModoLogin ? '#ffffff' : 'var(--text-secondary)',
                transition: 'color 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                position: 'relative',
                zIndex: 2
              }}
            >
              <UserPlus size={16} /> Cadastrar
            </button>
          </div>

          {/* Alerta de Erro */}
          {erro && (
            <div
              style={{
                backgroundColor: 'rgba(211, 1, 1, 0.15)',
                border: '1px solid rgba(211, 1, 1, 0.4)',
                color: '#f87171',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{erro}</span>
            </div>
          )}

          {/* Formulário com Animação de Expansão/Retração */}
          <form onSubmit={aoSubmeter}>
            {/* Campo Nome Completo (Expande apenas no Cadastro) */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: !ehModoLogin ? '1fr' : '0fr',
                opacity: !ehModoLogin ? 1 : 0,
                transform: !ehModoLogin ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.96)',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
              }}
            >
              <div style={{ minHeight: 0 }}>
                <div className="form-group" style={{ marginBottom: !ehModoLogin ? '16px' : '0' }}>
                  <label htmlFor="auth-name">Nome Completo</label>
                  <input
                    id="auth-name"
                    type="text"
                    className="form-input"
                    placeholder="Ex: Nathan Nicolau"
                    value={nome}
                    onChange={(e) => definirNome(e.target.value)}
                    required={!ehModoLogin}
                  />
                </div>
              </div>
            </div>

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

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label htmlFor="auth-password">Senha</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  id="auth-password"
                  type={mostrarSenha ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => definirSenha(e.target.value)}
                  style={{ paddingRight: '44px', width: '100%' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => definirMostrarSenha(!mostrarSenha)}
                  title={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '6px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={carregando}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '1rem',
                borderRadius: '12px'
              }}
            >
              {carregando ? (
                'Processando...'
              ) : ehModoLogin ? (
                <>
                  <LogIn size={18} /> Entrar no Sistema
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Criar Minha Conta
                </>
              )}
            </button>
          </form>

          {/* Dica de Acesso Rápido para Testes (Expande apenas no Login) */}
          <div
            style={{
              display: 'grid',
              gridTemplateRows: ehModoLogin ? '1fr' : '0fr',
              opacity: ehModoLogin ? 1 : 0,
              transform: ehModoLogin ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.96)',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}
          >
            <div style={{ minHeight: 0, paddingTop: ehModoLogin ? '16px' : '0' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed var(--border-color)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}
              >
                💡 <strong style={{ color: 'var(--text-main)' }}>Dica de Teste:</strong> Usuário padrão: <code>admin@fooddelivery.com</code> / <code>123456</code>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Carrossel SVG com Fundo Adaptável ao Tema */}
        <div
          style={{
            position: 'relative',
            background: 'var(--carousel-bg)',
            borderLeft: '1px solid var(--carousel-border)',
            padding: '48px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '480px',
            transition: 'background 0.3s ease, border-color 0.3s ease'
          }}
        >
          {/* Tag / Badge Superior */}
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px' }}>
            <span
              style={{
                backgroundColor: 'rgba(211, 1, 1, 0.2)',
                color: '#FF4D4D',
                border: '1px solid rgba(211, 1, 1, 0.4)',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {slideAtual.tag}
            </span>
          </div>

          {/* Ilustração SVG com Transição */}
          <div
            key={slideAtual.id}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '20px 0',
              animation: 'fadeInSlide 0.5s ease-in-out'
            }}
          >
            {slideAtual.renderSvg()}
          </div>

          {/* Informações do Slide */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              {slideAtual.titulo}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4', maxWidth: '340px', margin: '0 auto 20px auto' }}>
              {slideAtual.descricao}
            </p>

            {/* Controles de Navegação & Dots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={slideAnterior}
                aria-label="Slide anterior"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(211, 1, 1, 0.4)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
              >
                <ChevronLeft size={18} />
              </button>

              {/* Indicadores de Paginação */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {SLIDES_CARROSSEL.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => definirIndiceSlide(idx)}
                    aria-label={`Ir para slide ${idx + 1}`}
                    style={{
                      width: idx === indiceSlide ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: idx === indiceSlide ? 'var(--primary-accent)' : 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: idx === indiceSlide ? '0 0 8px rgba(211, 1, 1, 0.6)' : 'none'
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={proximoSlide}
                aria-label="Próximo slide"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(211, 1, 1, 0.4)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

