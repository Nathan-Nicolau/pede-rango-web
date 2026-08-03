import React, { useState, useEffect } from 'react';
import {
  Users, User, Truck, ShieldCheck, CheckCircle, XCircle,
  Search, RefreshCw, ChevronRight, Mail, Phone, MapPin, Car, Hash,
  Plus, Eye, EyeOff, X, AlertTriangle, UserPlus
} from 'lucide-react';
import { servicoUsuarios } from '../services/api';
import { labelPerfil, PERFIL_USUARIO_LABELS } from '../utils/statusLabels';
import { PaginationControls } from './PaginationControls';

// Configuração visual por perfil
const CONFIG_PERFIL = {
  CLIENTE: {
    label: 'Clientes',
    icon: User,
    accentColor: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.12)',
    accentBorder: 'rgba(6, 182, 212, 0.3)',
    descricao: 'Usuários que realizam pedidos na plataforma',
  },
  ENTREGADOR: {
    label: 'Entregadores',
    icon: Truck,
    accentColor: '#a855f7',
    accentBg: 'rgba(168, 85, 247, 0.12)',
    accentBorder: 'rgba(168, 85, 247, 0.3)',
    descricao: 'Responsáveis por realizar as entregas dos pedidos',
  },
  ADMIN: {
    label: 'Administradores',
    icon: ShieldCheck,
    accentColor: '#D30101',
    accentBg: 'rgba(211, 1, 1, 0.12)',
    accentBorder: 'rgba(211, 1, 1, 0.3)',
    descricao: 'Acesso total ao sistema e configurações',
  },
};

// Card individual de usuário adaptado ao perfil
function UsuarioCard({ usuario, config }) {
  const IconePerfil = config.icon;

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: '14px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        borderLeft: `3px solid ${config.accentColor}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 10px 28px rgba(0,0,0,0.4), 0 0 0 1px ${config.accentBorder}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Topo: avatar + nome + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: config.accentBg,
            border: `1px solid ${config.accentBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconePerfil size={22} color={config.accentColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {usuario.nome || '—'}
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px',
            }}
          >
            <Hash size={11} />
            ID {usuario.id}
          </div>
        </div>
        {/* Badge de status ativo/inativo */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: usuario.ativo
              ? 'rgba(16, 185, 129, 0.12)'
              : 'rgba(239, 68, 68, 0.12)',
            color: usuario.ativo ? '#34d399' : '#f87171',
            border: `1px solid ${usuario.ativo ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
            flexShrink: 0,
          }}
        >
          {usuario.ativo ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {usuario.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Linha divisória */}
      <div style={{ borderTop: '1px solid var(--border-color)' }} />

      {/* Detalhes: email + data */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Mail size={14} color={config.accentColor} style={{ flexShrink: 0 }} />
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {usuario.email || '—'}
          </span>
        </div>
        {usuario.criadoEm && (
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Cadastrado em:</span>
            <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
              {new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      {/* Badge de perfil */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: '8px',
          backgroundColor: config.accentBg,
          border: `1px solid ${config.accentBorder}`,
          fontSize: '0.8rem',
          fontWeight: 600,
          color: config.accentColor,
          alignSelf: 'flex-start',
        }}
      >
        <IconePerfil size={13} />
        {labelPerfil(usuario.perfil)}
      </div>
    </div>
  );
}

// Aba de perfil com contador
function AbaPerfilBtn({ perfilKey, config, ativo, contagem, onClick }) {
  const Icone = config.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        borderRadius: '12px',
        border: ativo ? `1px solid ${config.accentBorder}` : '1px solid transparent',
        backgroundColor: ativo ? config.accentBg : 'transparent',
        color: ativo ? config.accentColor : 'var(--text-secondary)',
        fontWeight: 600,
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!ativo) {
          e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
          e.currentTarget.style.color = 'var(--text-main)';
        }
      }}
      onMouseLeave={(e) => {
        if (!ativo) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      <Icone size={17} />
      {config.label}
      {contagem !== null && (
        <span
          style={{
            padding: '1px 7px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            backgroundColor: ativo ? config.accentColor : 'var(--border-color)',
            color: ativo ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            minWidth: '22px',
            textAlign: 'center',
          }}
        >
          {contagem}
        </span>
      )}
    </button>
  );
}

// Modal de Cadastro de Usuário
function CadastrarUsuarioModal({ aoFechar, aoSalvarComSucesso }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('CLIENTE');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const aoSubmeter = async (e) => {
    e.preventDefault();
    setErro(null);
    if (!nome.trim() || !email.trim() || senha.length < 6) {
      setErro('Preencha os campos obrigatórios. A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setCarregando(true);
    try {
      await servicoUsuarios.cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        perfil,
      });
      aoSalvarComSucesso();
      aoFechar();
    } catch (err) {
      setErro(err.message || 'Erro ao cadastrar usuário.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={aoFechar} style={{ padding: '16px' }}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(211,1,1,0.15)', padding: '10px', borderRadius: '12px', color: 'var(--primary-accent)' }}>
              <UserPlus size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Cadastrar Novo Usuário
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Cria uma conta de acesso com permissões específicas no sistema
              </p>
            </div>
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
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--primary-accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {erro && (
          <div style={{ backgroundColor: 'rgba(211,1,1,0.12)', border: '1px solid rgba(211,1,1,0.35)', color: '#f87171', padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {erro}
          </div>
        )}

        <form onSubmit={aoSubmeter}>
          <div className="form-group">
            <label htmlFor="usr-nome">Nome Completo *</label>
            <input id="usr-nome" type="text" className="form-input"
              placeholder="Ex: Carlos Eduardo Silva"
              value={nome} onChange={e => setNome(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="usr-email">E-mail de Acesso *</label>
              <input id="usr-email" type="email" className="form-input"
                placeholder="usuario@dominio.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="usr-perfil">Perfil / Função *</label>
              <select id="usr-perfil" className="form-input" value={perfil} onChange={e => setPerfil(e.target.value)} required>
                <option value="CLIENTE">Cliente (Acesso ao cardápio e pedidos)</option>
                <option value="ENTREGADOR">Entregador (Gestão e aceite de entregas)</option>
                <option value="ADMIN">Administrador (Acesso total)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="usr-senha">Senha Inicial (mín. 6 caracteres) *</label>
            <div style={{ position: 'relative' }}>
              <input id="usr-senha"
                type={mostrarSenha ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={senha} onChange={e => setSenha(e.target.value)}
                style={{ paddingRight: '44px', width: '100%' }}
                required minLength={6}
              />
              <button type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={aoFechar}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UsuariosView() {
  const [perfilAtivo, setPerfilAtivo] = useState('CLIENTE');
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(0);
  const [tamanho] = useState(12);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  // contagem por perfil (carregada uma vez)
  const [contagemPorPerfil, setContagemPorPerfil] = useState({});

  const config = CONFIG_PERFIL[perfilAtivo];

  // Carrega a lista do perfil ativo
  useEffect(() => {
    carregarUsuarios();
  }, [perfilAtivo, pagina]);

  // Carrega contagem de cada perfil na montagem
  useEffect(() => {
    carregarContagensAll();
  }, []);

  const carregarContagensAll = async () => {
    const perfis = Object.keys(CONFIG_PERFIL);
    const resultado = {};
    await Promise.allSettled(
      perfis.map(async (p) => {
        try {
          const resp = await servicoUsuarios.obterPorPerfilPaginado(p, 0, 1);
          resultado[p] = resp.totalElements ?? 0;
        } catch {
          resultado[p] = null;
        }
      })
    );
    setContagemPorPerfil(resultado);
  };

  const carregarUsuarios = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await servicoUsuarios.obterPorPerfilPaginado(perfilAtivo, pagina, tamanho);
      setUsuarios(Array.isArray(resp.content) ? resp.content : []);
      setTotalPaginas(resp.totalPages || 1);
      setTotalElementos(resp.totalElements || 0);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar usuários.');
    } finally {
      setCarregando(false);
    }
  };

  const aoMudarPerfil = (perfil) => {
    setPerfilAtivo(perfil);
    setPagina(0);
    setBusca('');
  };

  // Filtro local por busca
  const usuariosFiltrados = usuarios.filter((u) => {
    const termo = busca.toLowerCase();
    return (
      (u.nome || '').toLowerCase().includes(termo) ||
      (u.email || '').toLowerCase().includes(termo)
    );
  });

  const IconePerfil = config.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header da seção */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 24px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #D30101 0%, #9e0000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 6px 18px rgba(211,1,1,0.3)',
            }}
          >
            <Users size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Perfis de Usuário
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Visualize e explore os usuários cadastrados por tipo de perfil
            </p>
          </div>
        </div>

        <button onClick={() => setModalCadastroAberto(true)} className="btn-primary">
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      {/* Abas por perfil */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--bg-card)',
          padding: '8px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          overflowX: 'auto',
        }}
      >
        {Object.entries(CONFIG_PERFIL).map(([key, cfg]) => (
          <AbaPerfilBtn
            key={key}
            perfilKey={key}
            config={cfg}
            ativo={perfilAtivo === key}
            contagem={contagemPorPerfil[key] ?? null}
            onClick={() => aoMudarPerfil(key)}
          />
        ))}
      </div>

      {/* Barra de busca + info do perfil */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: `1px solid ${config.accentBorder}`,
          background: `linear-gradient(135deg, ${config.accentBg} 0%, var(--bg-card) 100%)`,
        }}
      >
        {/* Ícone + descrição */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: config.accentBg,
              border: `1px solid ${config.accentBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconePerfil size={20} color={config.accentColor} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: config.accentColor, fontSize: '1rem' }}>
              {config.label}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {config.descricao}
            </div>
          </div>
        </div>

        {/* Separador */}
        <div style={{ flex: 1, minWidth: '16px' }} />

        {/* Campo de busca */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
          <Search
            size={16}
            color="var(--text-secondary)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>

        {/* Botão de refresh */}
        <button
          onClick={carregarUsuarios}
          className="btn-secondary"
          style={{ padding: '10px 14px' }}
          title="Atualizar lista"
        >
          <RefreshCw size={16} className={carregando ? 'spin' : ''} />
        </button>
      </div>

      {/* Estado de erro */}
      {erro && (
        <div
          style={{
            backgroundColor: 'rgba(211,1,1,0.12)',
            border: '1px solid rgba(211,1,1,0.35)',
            color: '#f87171',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '0.9rem',
          }}
        >
          ⚠️ {erro}
        </div>
      )}

      {/* Grid de usuários */}
      {carregando && usuarios.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
          }}
        >
          Carregando {config.label.toLowerCase()}...
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
          }}
        >
          <IconePerfil size={40} color="var(--text-secondary)" style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
            {busca ? `Nenhum resultado para "${busca}"` : `Nenhum(a) ${config.label.toLowerCase()} cadastrado(a).`}
          </p>
        </div>
      ) : (
        <>
          {/* Contador de resultados */}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '2px' }}>
            Exibindo{' '}
            <strong style={{ color: 'var(--text-main)' }}>{usuariosFiltrados.length}</strong>
            {busca ? ` resultado(s) para "${busca}"` : ` ${config.label.toLowerCase()}`}
            {!busca && totalElementos > tamanho && (
              <> — total: <strong style={{ color: 'var(--text-main)' }}>{totalElementos}</strong></>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {usuariosFiltrados.map((u) => (
              <UsuarioCard key={u.id} usuario={u} config={config} />
            ))}
          </div>

          <PaginationControls
            paginaAtual={pagina}
            totalPaginas={totalPaginas}
            totalElementos={totalElementos}
            tamanhoPagina={tamanho}
            aoMudarPagina={(nova) => setPagina(nova)}
            aoMudarTamanho={() => {}}
          />
        </>
      )}

      {/* Modal de Cadastro */}
      {modalCadastroAberto && (
        <CadastrarUsuarioModal
          aoFechar={() => setModalCadastroAberto(false)}
          aoSalvarComSucesso={() => {
            carregarUsuarios();
            carregarContagensAll();
          }}
        />
      )}
    </div>
  );
}
