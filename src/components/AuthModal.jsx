import React, { useState, useEffect } from 'react';
import { servicoAutenticacao } from '../services/api';
import { Flame, Utensils, LogIn, UserPlus, AlertCircle, ChevronLeft, ChevronRight, Eye, EyeOff, CheckCircle2, XCircle, RefreshCw, MapPin, Phone, CreditCard, User, Mail, Lock } from 'lucide-react';

// Slides do Carrossel com SVGs Customizados no tema Vermelho & Dark
const SLIDES_CARROSSEL = [
  {
    id: 'entrega-rapida',
    titulo: 'Entregas Ágeis & Seguras',
    descricao: 'Conectamos seu restaurante aos clientes com máxima velocidade e confiabilidade a cada pedido.',
    tag: '⚡ Ultra-Rápido',
    renderSvg: () => (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', maxHeight: '230px' }}>
        <defs>
          <linearGradient id="redGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2E2E" />
            <stop offset="100%" stopColor="#9E0000" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <path d="M 30 70 L 150 70" stroke="#D30101" strokeWidth="3" strokeDasharray="8 6" opacity="0.4" />
        <path d="M 10 130 L 120 130" stroke="#D30101" strokeWidth="4" strokeDasharray="12 8" opacity="0.6" />
        <path d="M 40 190 L 160 190" stroke="#D30101" strokeWidth="3" strokeDasharray="6 6" opacity="0.4" />

        <circle cx="230" cy="150" r="95" fill="url(#redGlow)" opacity="0.15" filter="url(#glow)" />
        <circle cx="230" cy="150" r="80" stroke="url(#redGlow)" strokeWidth="2" strokeDasharray="6 6" opacity="0.4" />

        <g transform="translate(130, 70)">
          <circle cx="45" cy="120" r="24" fill="#141417" stroke="url(#redGlow)" strokeWidth="5" />
          <circle cx="45" cy="120" r="10" fill="#2E2E35" />
          <circle cx="145" cy="120" r="24" fill="#141417" stroke="url(#redGlow)" strokeWidth="5" />
          <circle cx="145" cy="120" r="10" fill="#2E2E35" />

          <path d="M 45 120 L 75 118 L 105 85 L 140 85 L 145 120" stroke="url(#redGlow)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 75 118 L 95 65 L 125 65" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />

          <path d="M 140 80 L 155 78" stroke="#FFE600" strokeWidth="5" strokeLinecap="round" filter="url(#glow)" />
          <polygon points="155,75 220,55 220,105 155,83" fill="#FFE600" opacity="0.15" />

          <rect x="20" y="55" width="45" height="45" rx="8" fill="url(#redGlow)" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M 35 70 L 50 70 M 42.5 62.5 L 42.5 77.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

          <circle cx="95" cy="45" r="14" fill="#D30101" />
          <path d="M 98 42 L 107 45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <path d="M 80 65 Q 95 60 110 75" stroke="#2A2A32" strokeWidth="12" strokeLinecap="round" />
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
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', maxHeight: '230px' }}>
        <defs>
          <linearGradient id="redGlow2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D30101" />
            <stop offset="100%" stopColor="#7A0000" />
          </linearGradient>
        </defs>

        <ellipse cx="200" cy="180" rx="120" ry="35" fill="#1C1C20" stroke="#2E2E35" strokeWidth="4" />
        <ellipse cx="200" cy="178" rx="90" ry="24" fill="#121214" stroke="url(#redGlow2)" strokeWidth="2" />

        <path d="M 110 170 C 110 90, 290 90, 290 170 Z" fill="url(#redGlow2)" opacity="0.85" />
        <path d="M 130 165 C 130 110, 270 110, 270 165 Z" stroke="#FFFFFF" strokeWidth="2" opacity="0.2" fill="none" />

        <circle cx="200" cy="90" r="14" fill="#FF4D4D" stroke="#FFFFFF" strokeWidth="2" />

        <path d="M 170 70 Q 160 50 175 35" stroke="#FF4D4D" strokeWidth="3" strokeLinecap="round" opacity="0.7" fill="none" />
        <path d="M 200 65 Q 215 45 200 25" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" fill="none" />
        <path d="M 230 70 Q 240 50 225 35" stroke="#FF4D4D" strokeWidth="3" strokeLinecap="round" opacity="0.7" fill="none" />

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
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', maxHeight: '230px' }}>
        <defs>
          <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1E24" />
            <stop offset="100%" stopColor="#121215" />
          </linearGradient>
        </defs>

        <rect x="120" y="20" width="160" height="260" rx="24" fill="url(#mapBg)" stroke="#2E2E35" strokeWidth="4" />
        <rect x="132" y="40" width="136" height="215" rx="12" fill="#141418" />

        <path d="M 132 100 L 268 100" stroke="#26262E" strokeWidth="8" />
        <path d="M 132 170 L 268 170" stroke="#26262E" strokeWidth="12" />
        <path d="M 180 40 L 180 255" stroke="#26262E" strokeWidth="10" />
        <path d="M 230 40 L 230 255" stroke="#26262E" strokeWidth="6" />

        <path d="M 150 210 Q 180 170 180 120 T 230 75" stroke="#D30101" strokeWidth="4" strokeDasharray="6 4" fill="none" />

        <circle cx="230" cy="75" r="16" fill="#D30101" opacity="0.3" />
        <circle cx="230" cy="75" r="10" fill="#D30101" />
        <circle cx="230" cy="75" r="4" fill="#FFFFFF" />

        <circle cx="150" cy="210" r="8" fill="#10B981" />
        <circle cx="150" cy="210" r="3" fill="#FFFFFF" />

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
  const [cpf, definirCpf] = useState('');
  const [telefone, definirTelefone] = useState('');
  const [enderecoPadrao, definirEnderecoPadrao] = useState('');
  
  const [mostrarSenha, definirMostrarSenha] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  // Estados de Validação Lazy Check
  const [checandoEmail, setChecandoEmail] = useState(false);
  const [emailJaExiste, setEmailJaExiste] = useState(false);

  const [checandoCpf, setChecandoCpf] = useState(false);
  const [cpfJaExiste, setCpfJaExiste] = useState(false);

  const [checandoTelefone, setChecandoTelefone] = useState(false);
  const [telefoneJaExiste, setTelefoneJaExiste] = useState(false);

  // Estado do Carrossel
  const [indiceSlide, definirIndiceSlide] = useState(0);

  // Auto-rotate slides a cada 4.5 segundos
  useEffect(() => {
    const temporizador = setInterval(() => {
      definirIndiceSlide((prev) => (prev + 1) % SLIDES_CARROSSEL.length);
    }, 4500);
    return () => clearInterval(temporizador);
  }, []);

  // Efeito Lazy Check para E-mail
  useEffect(() => {
    if (ehModoLogin) {
      setChecandoEmail(false);
      setEmailJaExiste(false);
      return;
    }

    const emailLimpo = email.trim();
    const regexEmailValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailLimpo || !regexEmailValido.test(emailLimpo)) {
      setChecandoEmail(false);
      setEmailJaExiste(false);
      return;
    }

    setChecandoEmail(true);
    setEmailJaExiste(false);

    const timer = setTimeout(async () => {
      try {
        const existe = await servicoAutenticacao.checarEmailExiste(emailLimpo);
        setEmailJaExiste(existe);
      } catch (err) {
        setEmailJaExiste(false);
      } finally {
        setChecandoEmail(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, ehModoLogin]);

  // Efeito Lazy Check para CPF
  useEffect(() => {
    if (ehModoLogin) {
      setChecandoCpf(false);
      setCpfJaExiste(false);
      return;
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length < 11) {
      setChecandoCpf(false);
      setCpfJaExiste(false);
      return;
    }

    setChecandoCpf(true);
    setCpfJaExiste(false);

    const timer = setTimeout(async () => {
      try {
        const existe = await servicoAutenticacao.checarCpfExiste(cpfLimpo);
        setCpfJaExiste(existe);
      } catch {
        setCpfJaExiste(false);
      } finally {
        setChecandoCpf(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cpf, ehModoLogin]);

  // Efeito Lazy Check para Telefone
  useEffect(() => {
    if (ehModoLogin) {
      setChecandoTelefone(false);
      setTelefoneJaExiste(false);
      return;
    }

    const telLimpo = telefone.replace(/\D/g, '');
    if (telLimpo.length < 10) {
      setChecandoTelefone(false);
      setTelefoneJaExiste(false);
      return;
    }

    setChecandoTelefone(true);
    setTelefoneJaExiste(false);

    const timer = setTimeout(async () => {
      try {
        const existe = await servicoAutenticacao.checarTelefoneExiste(telLimpo);
        setTelefoneJaExiste(existe);
      } catch {
        setTelefoneJaExiste(false);
      } finally {
        setChecandoTelefone(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [telefone, ehModoLogin]);

  const slideAtual = SLIDES_CARROSSEL[indiceSlide];

  // Regras de validação do formulário
  const emailValidoFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

  const formValido = ehModoLogin
    ? (emailValidoFormat && senha.length >= 1)
    : (
        nome.trim().length >= 3 &&
        emailValidoFormat &&
        !emailJaExiste &&
        !checandoEmail &&
        !cpfJaExiste &&
        !checandoCpf &&
        !telefoneJaExiste &&
        !checandoTelefone &&
        senha.length >= 6 &&
        cpf.trim().length >= 11 &&
        telefone.trim().length >= 10 &&
        enderecoPadrao.trim().length >= 5
      );

  const aoSubmeter = async (e) => {
    e.preventDefault();
    definirErro(null);

    if (!formValido) {
      if (!ehModoLogin && emailJaExiste) {
        definirErro('O e-mail informado já está cadastrado no sistema.');
        return;
      }
      if (!ehModoLogin && cpfJaExiste) {
        definirErro('O CPF informado já está cadastrado no sistema.');
        return;
      }
      if (!ehModoLogin && telefoneJaExiste) {
        definirErro('O telefone informado já está cadastrado no sistema.');
        return;
      }
      definirErro('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    definirCarregando(true);

    try {
      if (ehModoLogin) {
        const resposta = await servicoAutenticacao.entrar(email, senha);
        aoAutenticarComSucesso(resposta);
      } else {
        const resposta = await servicoAutenticacao.cadastrar({
          nome: nome.trim(),
          email: email.trim(),
          senha,
          cpf: cpf.trim(),
          telefone: telefone.trim(),
          enderecoPadrao: enderecoPadrao.trim()
        });
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
          maxWidth: '1120px',
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(480px, 1.2fr) minmax(360px, 0.8fr)',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(211, 1, 1, 0.15)'
        }}
      >
        {/* LADO ESQUERDO: Form de Login / Cadastro */}
        <div
          style={{
            padding: '36px 40px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'center',
            backgroundColor: 'var(--modal-left-bg)',
            transition: 'background-color 0.3s ease'
          }}
        >
          {/* Header Marca */}
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <div
              style={{
                display: 'inline-flex',
                background: 'linear-gradient(135deg, #D30101 0%, #850000 100%)',
                padding: '10px',
                borderRadius: '14px',
                marginBottom: '8px',
                boxShadow: '0 6px 20px rgba(211, 1, 1, 0.4)'
              }}
            >
              <Flame color="#ffffff" size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--title-color)', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
              {ehModoLogin ? 'Acessar Conta' : 'Cadastro de Cliente'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              {ehModoLogin ? 'Gerencie pedidos e acompanhe entregas com agilidade' : 'Preencha seus dados para criar sua conta de Cliente'}
            </p>
          </div>

          {/* Tab Toggle (Entrar / Cadastrar) */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              backgroundColor: 'var(--tab-bg)',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '18px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}
          >
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
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
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
              <LogIn size={15} /> Entrar
            </button>
            <button
              type="button"
              onClick={() => { definirEhModoLogin(false); definirErro(null); }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
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
              <UserPlus size={15} /> Cadastrar Cliente
            </button>
          </div>

          {/* Alerta de Erro */}
          {erro && (
            <div
              style={{
                backgroundColor: 'rgba(211, 1, 1, 0.15)',
                border: '1px solid rgba(211, 1, 1, 0.4)',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{erro}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={aoSubmeter} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Modo Login */}
            {ehModoLogin ? (
              <>
                <div className="form-group">
                  <label htmlFor="auth-email-login">E-mail *</label>
                  <input
                    id="auth-email-login"
                    type="email"
                    className="form-input"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => definirEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="auth-password-login">Senha *</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      id="auth-password-login"
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
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px'
                      }}
                    >
                      {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Modo Cadastro de Cliente */
              <>
                <div className="form-group">
                  <label htmlFor="auth-name">Nome Completo *</label>
                  <input
                    id="auth-name"
                    type="text"
                    className="form-input"
                    placeholder="Ex: Carlos Cliente"
                    value={nome}
                    onChange={(e) => definirNome(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Campo CPF (Aceita Apenas Números) */}
                  <div className="form-group">
                    <label htmlFor="auth-cpf">CPF (Apenas números) *</label>
                    <input
                      id="auth-cpf"
                      type="text"
                      className="form-input"
                      placeholder="00000000000"
                      maxLength={11}
                      value={cpf}
                      onChange={(e) => definirCpf(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{
                        borderColor: cpfJaExiste ? '#ef4444' : cpf.length === 11 && !checandoCpf && !cpfJaExiste ? '#10b981' : undefined
                      }}
                    />
                    {checandoCpf && (
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px', display: 'block' }}>Verificando CPF...</span>
                    )}
                    {!checandoCpf && cpfJaExiste && (
                      <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '2px', display: 'block' }}>CPF já cadastrado!</span>
                    )}
                  </div>

                  {/* Campo Telefone (Aceita Apenas Números) */}
                  <div className="form-group">
                    <label htmlFor="auth-telefone">Telefone (Apenas números) *</label>
                    <input
                      id="auth-telefone"
                      type="text"
                      className="form-input"
                      placeholder="11999999999"
                      maxLength={11}
                      value={telefone}
                      onChange={(e) => definirTelefone(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{
                        borderColor: telefoneJaExiste ? '#ef4444' : telefone.length >= 10 && !checandoTelefone && !telefoneJaExiste ? '#10b981' : undefined
                      }}
                    />
                    {checandoTelefone && (
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px', display: 'block' }}>Verificando Telefone...</span>
                    )}
                    {!checandoTelefone && telefoneJaExiste && (
                      <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '2px', display: 'block' }}>Telefone já cadastrado!</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label htmlFor="auth-email-reg">E-mail *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="auth-email-reg"
                        type="email"
                        className="form-input"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => definirEmail(e.target.value)}
                        required
                        style={{
                          borderColor: emailJaExiste
                            ? '#ef4444'
                            : emailValidoFormat && !checandoEmail && !emailJaExiste
                            ? '#10b981'
                            : undefined
                        }}
                      />
                    </div>
                    {checandoEmail && (
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px', display: 'block' }}>Verificando E-mail...</span>
                    )}
                    {!checandoEmail && emailJaExiste && (
                      <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '2px', display: 'block' }}>E-mail já cadastrado!</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="auth-password-reg">Senha (mín 6 chars) *</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        id="auth-password-reg"
                        type={mostrarSenha ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => definirSenha(e.target.value)}
                        style={{ paddingRight: '40px', width: '100%' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => definirMostrarSenha(!mostrarSenha)}
                        style={{
                          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
                        }}
                      >
                        {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="auth-endereco">Endereço Padrão de Entrega *</label>
                  <input
                    id="auth-endereco"
                    type="text"
                    className="form-input"
                    placeholder="Rua das Flores, 123 - Bairro, Cidade"
                    value={enderecoPadrao}
                    onChange={(e) => definirEnderecoPadrao(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Botão de Submeter */}
            <button
              type="submit"
              className="btn-primary"
              disabled={carregando || !formValido || (!ehModoLogin && (checandoEmail || checandoCpf || checandoTelefone))}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '0.95rem',
                borderRadius: '12px',
                marginTop: '4px',
                opacity: (carregando || !formValido || (!ehModoLogin && (checandoEmail || checandoCpf || checandoTelefone))) ? 0.55 : 1,
                cursor: (carregando || !formValido || (!ehModoLogin && (checandoEmail || checandoCpf || checandoTelefone))) ? 'not-allowed' : 'pointer'
              }}
            >
              {carregando ? (
                'Processando...'
              ) : (checandoEmail || checandoCpf || checandoTelefone) ? (
                'Verificando Dados...'
              ) : ehModoLogin ? (
                <>
                  <LogIn size={18} /> Entrar no Sistema
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Finalizar Cadastro de Cliente
                </>
              )}
            </button>
          </form>

          {/* Dica de Acesso Rápido para Testes */}
          {ehModoLogin && (
            <div style={{ marginTop: '14px' }}>
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed var(--border-color)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}
              >
                💡 <strong style={{ color: 'var(--text-main)' }}>Dica de Teste:</strong> <code>admin@fooddelivery.com</code> / <code>123456</code>
              </div>
            </div>
          )}
        </div>

        {/* LADO DIREITO: Carrossel SVG */}
        <div
          style={{
            position: 'relative',
            background: 'var(--carousel-bg)',
            borderLeft: '1px solid var(--carousel-border)',
            padding: '36px 30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '440px',
            transition: 'background 0.3s ease, border-color 0.3s ease'
          }}
        >
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

          <div
            key={slideAtual.id}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '16px 0',
              animation: 'fadeInSlide 0.5s ease-in-out'
            }}
          >
            {slideAtual.renderSvg()}
          </div>

          <div style={{ textAlign: 'center', width: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
              {slideAtual.titulo}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4', maxWidth: '320px', margin: '0 auto 16px auto' }}>
              {slideAtual.descricao}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={slideAnterior}
                aria-label="Slide anterior"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {SLIDES_CARROSSEL.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => definirIndiceSlide(idx)}
                    aria-label={`Ir para slide ${idx + 1}`}
                    style={{
                      width: idx === indiceSlide ? '22px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: idx === indiceSlide ? 'var(--primary-accent)' : 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
