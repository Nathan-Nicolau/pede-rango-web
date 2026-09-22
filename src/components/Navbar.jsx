import React, { useState, useEffect } from 'react';
import { Utensils, LogOut, Plus, User, Sun, Moon, ShieldCheck, Truck, X, Mail, CheckCircle, Phone, MapPin, Save, AlertCircle, Edit2 } from 'lucide-react';
import { labelPerfil } from '../utils/statusLabels';
import { servicoClientes, servicoEntregadores } from '../services/api';

export function Navbar({ usuario, aoSair, aoAbrirNovoPedido, tema, aoAlternarTema, configuracao, modalPerfilAberto: modalPerfilExterno, aoFecharPerfil }) {
  const [modalPerfilLocal, setModalPerfilLocal] = useState(false);
  const modalPerfilAberto = modalPerfilExterno !== undefined ? modalPerfilExterno : modalPerfilLocal;
  const setModalPerfilAberto = (val) => {
    setModalPerfilLocal(val);
    if (!val && aoFecharPerfil) aoFecharPerfil();
  };
  const nomeExibicao = usuario?.nome || usuario?.name || usuario?.email || 'Usuário';
  const perfil = usuario?.perfil || 'CLIENTE';

  // Estados de Edição de Perfil
  const [modoEdicao, setModoEdicao] = useState(false);
  const [entidadeId, setEntidadeId] = useState(null);
  const [telefone, setTelefone] = useState('');
  const [enderecoPadrao, setEnderecoPadrao] = useState('');
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [erroPerfil, setErroPerfil] = useState(null);

  // Configuração por perfil
  const perfisConfig = {
    ADMIN: { color: '#D30101', bg: 'rgba(211, 1, 1, 0.15)', border: 'rgba(211, 1, 1, 0.3)', icon: ShieldCheck },
    RESTAURANTE: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', icon: Utensils },
    ENTREGADOR: { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', icon: Truck },
    CLIENTE: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)', icon: User },
  };

  const cfg = perfisConfig[perfil] || perfisConfig.CLIENTE;
  const IconePerfil = cfg.icon;

  const estaAberta = configuracao?.operacionalmenteAbertaHoje;

  // Carrega dados do perfil ao abrir o modal
  useEffect(() => {
    if (!modalPerfilAberto || !usuario?.email) {
      setModoEdicao(false);
      return;
    }

    setMensagemSucesso(null);
    setErroPerfil(null);
    setCarregandoPerfil(true);
    setModoEdicao(false);

    if (perfil === 'CLIENTE') {
      servicoClientes.obterPorEmail(usuario.email)
        .then(dados => {
          if (dados) {
            setEntidadeId(dados.id);
            setTelefone(dados.telefone || '');
            setEnderecoPadrao(dados.enderecoPadrao || '');
          }
        })
        .catch(() => {})
        .finally(() => setCarregandoPerfil(false));
    } else if (perfil === 'ENTREGADOR') {
      servicoEntregadores.obterPorEmail(usuario.email)
        .then(dados => {
          if (dados) {
            setEntidadeId(dados.id);
            setTelefone(dados.telefone || '');
          }
        })
        .catch(() => {})
        .finally(() => setCarregandoPerfil(false));
    } else {
      setCarregandoPerfil(false);
    }
  }, [modalPerfilAberto, usuario, perfil]);

  // Salvar perfil do usuário
  const aoSalvarPerfil = async (e) => {
    e.preventDefault();
    setMensagemSucesso(null);
    setErroPerfil(null);

    if (!entidadeId) return;

    setSalvandoPerfil(true);
    try {
      if (perfil === 'CLIENTE') {
        await servicoClientes.atualizar(entidadeId, telefone.trim(), enderecoPadrao.trim());
      } else if (perfil === 'ENTREGADOR') {
        await servicoEntregadores.atualizarTelefone(entidadeId, telefone.trim());
      }
      setMensagemSucesso('Dados do perfil atualizados com sucesso!');
      setModoEdicao(false);
      setTimeout(() => setMensagemSucesso(null), 3500);
    } catch (err) {
      setErroPerfil(err.message || 'Erro ao atualizar dados do perfil.');
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const aoClicarSairDoModal = () => {
    setModalPerfilAberto(false);
    aoSair();
  };

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
          justify: 'space-between',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Marca (Alinhado à Esquerda) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: tema === 'light' ? '0 4px 14px rgba(211, 1, 1, 0.15)' : '0 4px 14px rgba(211, 1, 1, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tema === 'light' ? '#ffffff' : '#121216',
              border: tema === 'light' ? '1px solid rgba(211, 1, 1, 0.2)' : '1px solid rgba(211, 1, 1, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              <img
                src={tema === 'light' ? '/assets/logo-pede-rango-light.png' : '/assets/logo-pede-rango.png'}
                alt="Pede Rango Delivery"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
                  Pede Rango <span style={{ color: 'var(--primary-accent)', fontSize: '0.85rem', fontWeight: 600 }}>WEB</span>
                </h1>
                {configuracao && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: estaAberta ? 'rgba(16, 185, 129, 0.15)' : 'rgba(211, 1, 1, 0.15)',
                    color: estaAberta ? '#10b981' : '#f87171',
                    border: `1px solid ${estaAberta ? 'rgba(16, 185, 129, 0.35)' : 'rgba(211, 1, 1, 0.35)'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: estaAberta ? '#10b981' : '#f87171' }} />
                    {estaAberta ? 'Aberto' : 'Fechado'}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                {estaAberta && configuracao?.tempoEstimadoMinMinutos
                  ? `Entrega: ${configuracao.tempoEstimadoMinMinutos}-${configuracao.tempoEstimadoMaxMinutos} min • Taxa R$ ${Number(configuracao.taxaEntregaPadrao || 0).toFixed(2)}`
                  : 'Gestão e Operações de Delivery'}
              </p>
            </div>
          </div>

          {/* Controles de Ação (Alinhado à Direita) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: 'auto' }}>
            {usuario && perfil === 'CLIENTE' && (
              <button
                onClick={aoAbrirNovoPedido}
                disabled={configuracao && !estaAberta}
                className="btn-primary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  opacity: (configuracao && !estaAberta) ? 0.5 : 1,
                  cursor: (configuracao && !estaAberta) ? 'not-allowed' : 'pointer',
                  filter: (configuracao && !estaAberta) ? 'grayscale(0.6)' : 'none'
                }}
                title={configuracao && !estaAberta ? 'Estabelecimento fechado para novos pedidos no momento' : 'Fazer novo pedido'}
              >
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

                {/* Botão de Sair Direct */}
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

      {/* Modal de Perfil do Usuário */}
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
              maxWidth: '480px',
              width: '100%',
              margin: 'auto',
              borderRadius: '20px',
              padding: '24px 28px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Cabeçalho do Modal */}
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
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-input)',
              border: `1px solid ${cfg.border}`,
              marginBottom: '18px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: cfg.bg,
                border: `2px solid ${cfg.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: cfg.color,
                marginBottom: '10px',
                boxShadow: `0 6px 16px ${cfg.bg}`
              }}>
                <IconePerfil size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                {nomeExibicao}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                {usuario.email}
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: cfg.bg,
                border: `1px solid ${cfg.border}`,
                fontSize: '0.78rem',
                fontWeight: 700,
                color: cfg.color
              }}>
                <IconePerfil size={13} />
                Perfil: {labelPerfil(perfil)}
              </div>
            </div>

            {/* Alertas de Sucesso / Erro */}
            {mensagemSucesso && (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#10b981', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> {mensagemSucesso}
              </div>
            )}
            {erroPerfil && (
              <div style={{ backgroundColor: 'rgba(211, 1, 1, 0.12)', border: '1px solid rgba(211, 1, 1, 0.35)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {erroPerfil}
              </div>
            )}

            {/* Seção de Dados / Formulário de Edição */}
            {(perfil === 'CLIENTE' || perfil === 'ENTREGADOR') && (
              <div style={{ marginBottom: '20px' }}>
                {/* Visualização Padrão (Sem formulário aberto) */}
                {!modoEdicao ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color={cfg.color} /> Telefone:
                      </span>
                      <strong style={{ color: 'var(--text-main)' }}>{telefone || 'Não informado'}</strong>
                    </div>

                    {perfil === 'CLIENTE' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} color={cfg.color} /> Endereço Padrão:
                        </span>
                        <strong style={{ color: 'var(--text-main)', textAlign: 'right', maxWidth: '200px', wordBreak: 'break-word' }}>{enderecoPadrao || 'Não informado'}</strong>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setModoEdicao(true)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card-hover)',
                        color: 'var(--text-main)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginTop: '4px'
                      }}
                    >
                      <Edit2 size={14} /> Editar Dados
                    </button>
                  </div>
                ) : (
                  /* Formulário de Edição Aberto */
                  <form onSubmit={aoSalvarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                      Editar Informações de Contato
                    </div>

                    {/* Telefone */}
                    <div className="form-group">
                      <label htmlFor="perfil-telefone" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <Phone size={13} color={cfg.color} /> Telefone *
                      </label>
                      <input
                        id="perfil-telefone"
                        type="text"
                        className="form-input"
                        placeholder="Ex: 11999999999 (apenas números)"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ''))}
                        disabled={carregandoPerfil}
                        required
                      />
                    </div>

                    {/* Endereço Padrão APENAS para CLIENTE */}
                    {perfil === 'CLIENTE' && (
                      <div className="form-group">
                        <label htmlFor="perfil-endereco" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                          <MapPin size={13} color={cfg.color} /> Endereço Padrão de Entrega *
                        </label>
                        <input
                          id="perfil-endereco"
                          type="text"
                          className="form-input"
                          placeholder="Ex: Rua das Flores, 123 - Centro"
                          value={enderecoPadrao}
                          onChange={(e) => setEnderecoPadrao(e.target.value)}
                          disabled={carregandoPerfil}
                          required
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setModoEdicao(false)}
                        className="btn-secondary"
                        style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={salvandoPerfil || carregandoPerfil || !entidadeId}
                        style={{
                          flex: 1,
                          justify: 'center',
                          padding: '9px',
                          fontSize: '0.82rem',
                          borderRadius: '8px',
                          backgroundColor: cfg.color
                        }}
                      >
                        <Save size={15} /> {salvandoPerfil ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Informações para ADMIN / RESTAURANTE */}
            {(perfil === 'ADMIN' || perfil === 'RESTAURANTE') && (
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
            )}

            {/* Botões de Ação do Modal */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => setModalPerfilAberto(false)} style={{ flex: 1, justifyContent: 'center' }}>
                Fechar
              </button>
              <button type="button" className="btn-primary" onClick={aoClicarSairDoModal} style={{ flex: 1, justifyContent: 'center', backgroundColor: '#D30101' }}>
                <LogOut size={16} /> Sair da Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
