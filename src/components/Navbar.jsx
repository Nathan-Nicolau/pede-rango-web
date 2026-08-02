import React, { useState } from 'react';
import { Utensils, LogOut, Plus, User, Sun, Moon, ShieldCheck, Truck, X, Hash, Mail, CheckCircle } from 'lucide-react';
import { labelPerfil } from '../utils/statusLabels';

export function Navbar({ usuario, aoSair, aoAbrirNovoPedido, tema, aoAlternarTema }) {
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const nomeExibicao = usuario?.nome || usuario?.name || usuario?.email || 'Usuário';
  const perfil = usuario?.perfil || 'CLIENTE';

  // Configuração por perfil
  const perfisConfig = {
    ADMIN: { color: '#D30101', bg: 'rgba(211, 1, 1, 0.15)', border: 'rgba(211, 1, 1, 0.3)', icon: ShieldCheck },
    ENTREGADOR: { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', icon: Truck },
    CLIENTE: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)', icon: User },
  };

  const cfg = perfisConfig[perfil] || perfisConfig.CLIENTE;
  const IconePerfil = cfg.icon;

  return (
    <>
      <header style={{
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--header-bg)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Marca */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #D30101 0%, #9e0000 100%)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(211, 1, 1, 0.3)'
            }}>
              <Utensils color="#ffffff" size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
                FoodDelivery <span style={{ color: 'var(--primary-accent)', fontSize: '0.85rem', fontWeight: 600 }}>WEB</span>
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Gestão e Operações de Delivery</p>
            </div>
          </div>

          {/* Controles de Ação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {usuario && (perfil === 'ADMIN' || perfil === 'CLIENTE') && (
              <button onClick={aoAbrirNovoPedido} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <Plus size={16} /> Novo Pedido
              </button>
            )}

            {/* Botão de Alternar Tema Light/Dark */}
            <button
              type="button"
              onClick={aoAlternarTema}
              title={tema === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '8px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--primary-accent)')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              {tema === 'dark' ? (
                <>
                  <Sun size={17} color="#f59e0b" />
                  <span>Claro</span>
                </>
              ) : (
                <>
                  <Moon size={17} color="#a855f7" />
                  <span>Escuro</span>
                </>
              )}
            </button>

            {/* Card / Perfil do Usuário Logado */}
            {usuario && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px', borderLeft: '1px solid var(--border-color)' }}>
                <div
                  onClick={() => setModalPerfilAberto(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-card)',
                    border: `1px solid ${cfg.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cfg.color,
                    flexShrink: 0
                  }}>
                    <IconePerfil size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                        {nomeExibicao}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: cfg.color,
                      display: 'inline-block'
                    }}>
                      {labelPerfil(perfil)}
                    </span>
                  </div>
                </div>

                {/* Botão de Sair */}
                <button
                  onClick={aoSair}
                  title="Sair da conta"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '8px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#D30101'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <LogOut size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Detalhes do Perfil do Usuário (Renderizado fora do header para centralização perfeita) */}
      {modalPerfilAberto && usuario && (
        <div
          className="modal-overlay"
          onClick={() => setModalPerfilAberto(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            padding: '20px',
          }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              margin: 'auto',
              borderRadius: '20px',
              padding: '24px 28px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Cabeçalho do Modal (Alinhamento corrigido para img3.png) */}
            <div style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              width: '100%',
              gap: '16px',
              marginBottom: '20px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <User size={20} color={cfg.color} /> Perfil do Usuário
              </h3>
              <button
                onClick={() => setModalPerfilAberto(false)}
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
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--primary-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Cartão de Identificação do Perfil */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-input)',
              border: `1px solid ${cfg.border}`,
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                backgroundColor: cfg.bg,
                border: `2px solid ${cfg.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: cfg.color,
                marginBottom: '12px',
                boxShadow: `0 6px 16px ${cfg.bg}`
              }}>
                <IconePerfil size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                {nomeExibicao}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                {usuario.email}
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: cfg.bg,
                border: `1px solid ${cfg.border}`,
                fontSize: '0.8rem',
                fontWeight: 700,
                color: cfg.color
              }}>
                <IconePerfil size={14} />
                Perfil: {labelPerfil(perfil)}
              </div>
            </div>

            {/* Detalhes Técnicos da Conta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} color={cfg.color} /> E-mail Registrado:
                </span>
                <strong style={{ color: 'var(--text-main)' }}>{usuario.email}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={15} color="#10b981" /> Status da Conta:
                </span>
                <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={13} /> Ativa
                </span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => setModalPerfilAberto(false)} style={{ flex: 1, justifyContent: 'center' }}>
                Fechar
              </button>
              <button type="button" className="btn-primary" onClick={aoSair} style={{ flex: 1, justifyContent: 'center', backgroundColor: '#D30101' }}>
                <LogOut size={16} /> Sair da Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
