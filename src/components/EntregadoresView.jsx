import React, { useState, useEffect } from 'react';
import { servicoEntregadores } from '../services/api';
import { PaginationControls } from './PaginationControls';
import { CreateEntregadorModal } from './CreateEntregadorModal';
import { Truck, Plus, Search, User, Phone, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export function EntregadoresView() {
  const [entregadores, definirEntregadores] = useState([]);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  // Paginação
  const [pagina, definirPagina] = useState(0);
  const [tamanho, definirTamanho] = useState(10);
  const [totalPaginas, definirTotalPaginas] = useState(1);
  const [totalElementos, definirTotalElementos] = useState(0);

  // Filtro local & Modais
  const [termoBusca, definirTermoBusca] = useState('');
  const [modalCriacaoAberto, definirModalCriacaoAberto] = useState(false);

  useEffect(() => {
    carregarEntregadores();
  }, [pagina, tamanho]);

  const carregarEntregadores = async () => {
    definirCarregando(true);
    definirErro(null);
    try {
      const dados = await servicoEntregadores.obterTodosPaginado(pagina, tamanho);
      definirEntregadores(dados.content || []);
      definirTotalPaginas(dados.totalPages || 1);
      definirTotalElementos(dados.totalElements || 0);
    } catch (err) {
      definirErro(err.message || 'Erro ao carregar lista de entregadores.');
    } finally {
      definirCarregando(false);
    }
  };

  const aoAlternarDisponibilidade = async (id, statusAtual) => {
    try {
      const entregadorAtualizado = await servicoEntregadores.alternarDisponibilidade(id, !statusAtual);
      definirEntregadores(entregadores.map(e => e.id === id ? entregadorAtualizado : e));
    } catch (err) {
      alert('Erro ao alterar disponibilidade: ' + err.message);
    }
  };

  const aoCriarComSucesso = (novoEntregador) => {
    carregarEntregadores();
  };

  const entregadoresFiltrados = entregadores.filter(e => {
    const nome = (e.nome || '').toLowerCase();
    const email = (e.email || '').toLowerCase();
    const telefone = (e.telefone || '').toLowerCase();
    const veiculo = (e.veiculo || '').toLowerCase();
    const termo = termoBusca.toLowerCase();

    return nome.includes(termo) || email.includes(termo) || telefone.includes(termo) || veiculo.includes(termo);
  });

  return (
    <div>
      {/* Topo da Aba */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Truck size={26} color="var(--primary-accent)" /> Gestão de Entregadores
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Consulte a frota, altere disponibilidades e cadastre novos entregadores.
          </p>
        </div>

        <button onClick={() => definirModalCriacaoAberto(true)} className="btn-primary">
          <Plus size={18} /> Novo Entregador
        </button>
      </div>

      {/* Barra de Busca e Atualizar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        backgroundColor: 'var(--bg-card)',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar entregador por nome, telefone, veículo ou e-mail..."
            value={termoBusca}
            onChange={(e) => definirTermoBusca(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>

        <button onClick={carregarEntregadores} className="btn-secondary" title="Atualizar entregadores">
          <RefreshCw size={16} className={carregando ? 'spin' : ''} />
        </button>
      </div>

      {erro && (
        <div style={{ backgroundColor: 'rgba(211, 1, 1, 0.15)', border: '1px solid rgba(211, 1, 1, 0.4)', color: '#f87171', padding: '14px', borderRadius: '12px', marginBottom: '24px' }}>
          {erro}
        </div>
      )}

      {/* Grid de Entregadores */}
      {carregando && entregadores.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Carregando entregadores...
        </div>
      ) : entregadoresFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '6px' }}>Nenhum entregador encontrado</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cadastre um entregador para vinculá-lo aos pedidos.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {entregadoresFiltrados.map((entregador) => (
            <div
              key={entregador.id}
              className="glass-panel"
              style={{
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: entregador.disponivel ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                    color: entregador.disponivel ? '#10b981' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {entregador.nome || `Entregador #${entregador.id}`}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {entregador.email || 'Sem e-mail'}
                    </span>
                  </div>
                </div>

                <span style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: entregador.disponivel ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: entregador.disponivel ? '#34d399' : '#f87171',
                  border: `1px solid ${entregador.disponivel ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`
                }}>
                  {entregador.disponivel ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              {/* Informações de Veículo e Telefone */}
              <div style={{
                backgroundColor: 'var(--bg-input)',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)' }}>
                  <span><Truck size={14} style={{ display: 'inline', marginRight: '6px' }} /> Veículo:</span>
                  <strong>{entregador.veiculo} {entregador.placa ? `(${entregador.placa})` : ''}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span><Phone size={14} style={{ display: 'inline', marginRight: '6px' }} /> Telefone:</span>
                  <span>{entregador.telefone}</span>
                </div>
              </div>

              {/* Ação de Alterar Disponibilidade */}
              <button
                type="button"
                onClick={() => aoAlternarDisponibilidade(entregador.id, entregador.disponivel)}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '8px', fontSize: '0.85rem' }}
              >
                {entregador.disponivel ? (
                  <>
                    <XCircle size={16} color="#ef4444" /> Ficar Offline
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} color="#10b981" /> Ficar Online / Disponível
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Controle de Paginação */}
      <PaginationControls
        paginaAtual={pagina}
        totalPaginas={totalPaginas}
        totalElementos={totalElementos}
        tamanhoPagina={tamanho}
        aoMudarPagina={(novaPagina) => definirPagina(novaPagina)}
        aoMudarTamanho={(novoTamanho) => { definirTamanho(novoTamanho); definirPagina(0); }}
      />

      {/* Modal de Criação */}
      {modalCriacaoAberto && (
        <CreateEntregadorModal
          aoFechar={() => definirModalCriacaoAberto(false)}
          aoCriarComSucesso={aoCriarComSucesso}
        />
      )}
    </div>
  );
}
