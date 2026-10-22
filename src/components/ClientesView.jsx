import React, { useState, useEffect } from 'react';
import {
  Users, User, Mail, Phone, MapPin, Hash,
  Eye, EyeOff, Plus, RefreshCw, Search,
  CheckCircle, XCircle, X, Lock, AlertTriangle, MessageSquare
} from 'lucide-react';
import { servicoClientes } from '../services/api';
import { PaginationControls } from './PaginationControls';
import { abrirWhatsapp } from '../utils/whatsapp';

// ─── Utilidades ───────────────────────────────────────────────────────────────
const mascararCpf = (cpf) => {
  if (!cpf) return '—';
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11) return cpf;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
};

const formatarTelefone = (tel) => {
  if (!tel) return '—';
  const nums = tel.replace(/\D/g, '');
  if (nums.length === 11) return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  if (nums.length === 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return tel;
};

// ─── Modal de Cadastro de Cliente ─────────────────────────────────────────────
function CadastrarClienteModal({ aoFechar, aoSalvarComSucesso }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [enderecoPadrao, setEnderecoPadrao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const aoSubmeter = async (e) => {
    e.preventDefault();
    setErro(null);
    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setCarregando(true);
    try {
      await servicoClientes.cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        cpf: cpf.trim() || null,
        telefone: telefone.trim() || null,
        enderecoPadrao: enderecoPadrao.trim() || null,
      });
      aoSalvarComSucesso();
      aoFechar();
    } catch (err) {
      setErro(err.message || 'Erro ao cadastrar cliente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={aoFechar} style={{ padding: '20px' }}>
      <div className="modal-content modal-content-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              backgroundColor: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={20} color="#06b6d4" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Cadastrar Cliente
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Cria conta de acesso e perfil de cliente automaticamente
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

        {/* Erro */}
        {erro && (
          <div style={{
            backgroundColor: 'rgba(211,1,1,0.12)', border: '1px solid rgba(211,1,1,0.35)',
            color: '#f87171', padding: '12px 14px', borderRadius: '10px',
            fontSize: '0.85rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} /> {erro}
          </div>
        )}

        <form onSubmit={aoSubmeter}>
          {/* Campos obrigatórios */}
          <div style={{
            padding: '14px 16px', borderRadius: '12px', marginBottom: '16px',
            backgroundColor: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)',
          }}>
            <p style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 600, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Dados de Acesso (obrigatórios)
            </p>

            <div className="form-group">
              <label htmlFor="cli-nome">Nome Completo</label>
              <input id="cli-nome" type="text" className="form-input"
                placeholder="Ex: Ana Beatriz Santos"
                value={nome} onChange={e => setNome(e.target.value)} required />
            </div>

            <div className="form-group">
              <label htmlFor="cli-email">E-mail</label>
              <input id="cli-email" type="email" className="form-input"
                placeholder="cliente@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="cli-senha">Senha (mín. 6 caracteres)</label>
              <div style={{ position: 'relative' }}>
                <input id="cli-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={senha} onChange={e => setSenha(e.target.value)}
                  style={{ paddingRight: '44px', width: '100%' }}
                  required minLength={6}
                />
                <button type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                  }}>
                  {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          </div>

          {/* Campos opcionais */}
          <div style={{
            padding: '14px 16px', borderRadius: '12px', marginBottom: '22px',
            backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)',
          }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Dados do Perfil (opcionais)
            </p>

            <div className="auth-form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="cli-cpf">CPF (Apenas números)</label>
                <input id="cli-cpf" type="text" inputMode="numeric" className="form-input"
                  placeholder="00000000000"
                  value={cpf} onChange={e => setCpf(e.target.value.replace(/\D/g, ''))} maxLength={11} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="cli-telefone">Telefone (Apenas números)</label>
                <input id="cli-telefone" type="text" inputMode="numeric" className="form-input"
                  placeholder="11999999999"
                  value={telefone} onChange={e => setTelefone(e.target.value.replace(/\D/g, ''))} maxLength={11} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0, marginTop: '12px' }}>
              <label htmlFor="cli-endereco">Endereço Padrão</label>
              <input id="cli-endereco" type="text" className="form-input"
                placeholder="Ex: Rua das Flores, 123 - São Paulo, SP"
                value={enderecoPadrao} onChange={e => setEnderecoPadrao(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn-secondary" onClick={aoFechar} style={{ flex: 1, justifyContent: 'center' }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={carregando} style={{ flex: 1, justifyContent: 'center' }}>
              {carregando ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Card de Cliente ──────────────────────────────────────────────────────────
function ClienteCard({ cliente }) {
  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: '14px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        borderLeft: '3px solid #06b6d4',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(6,182,212,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
    >
      {/* Topo: avatar + nome + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
          backgroundColor: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={22} color="#06b6d4" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {cliente.nome || '—'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Hash size={11} /> ID {cliente.id} {cliente.usuarioId ? `· Usuário #${cliente.usuarioId}` : ''}
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
          backgroundColor: cliente.ativo ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          color: cliente.ativo ? '#34d399' : '#f87171',
          border: `1px solid ${cliente.ativo ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
        }}>
          {cliente.ativo ? <CheckCircle size={11} /> : <XCircle size={11} />}
          {cliente.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Separador */}
      <div style={{ borderTop: '1px solid var(--border-color)' }} />

      {/* Detalhes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {/* Email */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Mail size={14} color="#06b6d4" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {cliente.email || '—'}
          </span>
        </div>

        {/* CPF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Hash size={14} color="#06b6d4" style={{ flexShrink: 0 }} />
          <span>CPF: {mascararCpf(cliente.cpf)}</span>
        </div>

        {/* Telefone */}
        {cliente.telefone && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} color="#06b6d4" style={{ flexShrink: 0 }} />
              <span>{formatarTelefone(cliente.telefone)}</span>
            </div>
            <button
              type="button"
              onClick={() => abrirWhatsapp(cliente.telefone, `Olá ${cliente.nome || ''}, contato da equipe Pede Rango.`)}
              style={{
                background: 'none',
                border: 'none',
                color: '#25D366',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: 'rgba(37, 211, 102, 0.12)'
              }}
              title="Chamar cliente no WhatsApp"
            >
              <MessageSquare size={12} /> WhatsApp
            </button>
          </div>
        )}

        {/* Endereço */}
        {cliente.enderecoPadrao && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <MapPin size={14} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ lineHeight: 1.35 }}>{cliente.enderecoPadrao}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export function ClientesView() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(0);
  const [tamanho] = useState(12);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, [pagina]);

  const carregarClientes = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await servicoClientes.obterTodosPaginado(pagina, tamanho);
      setClientes(Array.isArray(resp.content) ? resp.content : []);
      setTotalPaginas(resp.totalPages || 1);
      setTotalElementos(resp.totalElements || 0);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar clientes.');
    } finally {
      setCarregando(false);
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    const termo = busca.toLowerCase();
    return (
      (c.nome || '').toLowerCase().includes(termo) ||
      (c.email || '').toLowerCase().includes(termo) ||
      (c.cpf || '').includes(termo)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div className="view-header-row" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        padding: '20px 24px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
            backgroundColor: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={24} color="#06b6d4" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Clientes Cadastrados
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Clientes com conta de acesso e perfil vinculado
            </p>
          </div>
        </div>
        <button onClick={() => setModalAberto(true)} className="btn-primary">
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* Barra de busca */}
      <div className="view-search-row" style={{
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        padding: '14px 18px', backgroundColor: 'var(--bg-card)', borderRadius: '16px',
        border: '1px solid rgba(6,182,212,0.2)',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, var(--bg-card) 100%)',
      }}>
        <div className="search-input-wrapper" style={{ position: 'relative', width: '100%' }}>
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
          <input type="text" className="search-input-with-icon form-input"
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={busca} onChange={e => setBusca(e.target.value)}
            style={{ paddingLeft: '42px', width: '100%' }}
          />
        </div>
        <div className="view-search-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={carregarClientes} className="btn-secondary" style={{ padding: '10px 14px' }} title="Atualizar lista">
            <RefreshCw size={16} className={carregando ? 'spin' : ''} />
          </button>
          {totalElementos > 0 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              <strong style={{ color: '#06b6d4' }}>{totalElementos}</strong> cliente(s) no total
            </span>
          )}
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div style={{
          backgroundColor: 'rgba(211,1,1,0.12)', border: '1px solid rgba(211,1,1,0.35)',
          color: '#f87171', padding: '14px 18px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <AlertTriangle size={18} /> {erro}
        </div>
      )}

      {/* Grid */}
      {carregando && clientes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Carregando clientes...
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)',
        }}>
          <User size={40} color="var(--text-secondary)" style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
            {busca ? `Nenhum cliente encontrado para "${busca}"` : 'Nenhum cliente cadastrado ainda.'}
          </p>
          {!busca && (
            <button onClick={() => setModalAberto(true)} className="btn-primary" style={{ marginTop: '16px' }}>
              <Plus size={16} /> Cadastrar Primeiro Cliente
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Exibindo <strong style={{ color: 'var(--text-main)' }}>{clientesFiltrados.length}</strong> cliente(s)
            {!busca && totalElementos > tamanho && (
              <> — total: <strong style={{ color: 'var(--text-main)' }}>{totalElementos}</strong></>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {clientesFiltrados.map(c => (
              <ClienteCard key={c.id} cliente={c} />
            ))}
          </div>

          <PaginationControls
            paginaAtual={pagina}
            totalPaginas={totalPaginas}
            totalElementos={totalElementos}
            tamanhoPagina={tamanho}
            aoMudarPagina={nova => setPagina(nova)}
            aoMudarTamanho={() => {}}
          />
        </>
      )}

      {/* Modal */}
      {modalAberto && (
        <CadastrarClienteModal
          aoFechar={() => setModalAberto(false)}
          aoSalvarComSucesso={carregarClientes}
        />
      )}
    </div>
  );
}
