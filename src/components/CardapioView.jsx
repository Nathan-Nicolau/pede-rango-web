import React, { useState, useEffect } from 'react';
import { servicoProdutos } from '../services/api';
import { PaginationControls } from './PaginationControls';
import {
  UtensilsCrossed, Plus, Search, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Edit2, X, Clock, Bike, Store, ShoppingBag
} from 'lucide-react';

const CATEGORIAS = ['Lanches', 'Pizzas', 'Acompanhamentos', 'Bebidas', 'Combos', 'Sobremesas'];

// ─── Modal de Cadastro / Edição de Produto ──────────────────────────────────────
function CadastrarProdutoModal({ produtoParaEditar, aoFechar, aoSalvarComSucesso }) {
  const isEdicao = !!produtoParaEditar;
  const [nome, setNome] = useState(produtoParaEditar?.nome || '');
  const [categoria, setCategoria] = useState(produtoParaEditar?.categoria || 'Lanches');
  const [preco, setPreco] = useState(produtoParaEditar?.preco ? String(produtoParaEditar.preco) : '');
  const [descricao, setDescricao] = useState(produtoParaEditar?.descricao || '');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const aoSubmeter = async (e) => {
    e.preventDefault();
    setErro(null);
    if (!nome.trim() || !preco || Number(preco) <= 0) {
      setErro('Informe um nome válido e um preço maior que zero.');
      return;
    }
    setCarregando(true);
    try {
      const payload = {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        preco: parseFloat(preco),
        categoria,
      };

      if (isEdicao) {
        await servicoProdutos.atualizar(produtoParaEditar.id, payload);
      } else {
        await servicoProdutos.cadastrar(payload);
      }
      aoSalvarComSucesso();
      aoFechar();
    } catch (err) {
      setErro(err.message || (isEdicao ? 'Erro ao atualizar produto.' : 'Erro ao cadastrar produto.'));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={aoFechar} style={{ padding: '20px' }}>
      <div className="modal-content modal-content-lg" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UtensilsCrossed size={22} color="var(--primary-accent)" /> {isEdicao ? 'Editar Produto do Cardápio' : 'Cadastrar Produto no Cardápio'}
          </h3>
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
          <div style={{ backgroundColor: 'rgba(211,1,1,0.15)', border: '1px solid rgba(211,1,1,0.4)', color: '#f87171', padding: '14px 18px', borderRadius: '12px', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} /> {erro}
          </div>
        )}

        <form onSubmit={aoSubmeter}>
          <div className="form-group">
            <label htmlFor="prod-nome">Nome do Produto *</label>
            <input id="prod-nome" type="text" className="form-input"
              placeholder="Ex: X-Salada Bacon Gourmet"
              value={nome} onChange={e => setNome(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div className="form-group">
              <label htmlFor="prod-categoria">Categoria *</label>
              <select id="prod-categoria" className="form-input" value={categoria} onChange={e => setCategoria(e.target.value)} required>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="prod-preco">Preço (R$) *</label>
              <input id="prod-preco" type="text" inputMode="decimal" className="form-input"
                placeholder="Ex: 29.90"
                value={preco} onChange={e => setPreco(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label htmlFor="prod-descricao">Descrição do Prato</label>
            <textarea id="prod-descricao" className="form-input" rows={4}
              placeholder="Ingredientes, modo de preparo, adicionais inclusos..."
              value={descricao} onChange={e => setDescricao(e.target.value)}
              style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={aoFechar} style={{ minWidth: '120px' }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={carregando} style={{ minWidth: '160px' }}>
              {carregando ? (isEdicao ? 'Atualizando...' : 'Salvando...') : (isEdicao ? 'Salvar Alterações' : 'Cadastrar Produto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Card do Produto Modernizado ─────────────────────────────────────────────
function CardProduto({ produto, podeEditar, aoEditar, aoAlternarStatus, alternandoStatus, aoPedirItem, aberta, isCliente }) {
  const isAtivo = produto.ativo !== false;

  return (
    <div
      className="glass-panel hover-lift"
      style={{
        borderRadius: '18px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        opacity: isAtivo ? 1 : 0.65,
        border: isAtivo ? '1px solid var(--border-color)' : '1px dashed rgba(239, 68, 68, 0.4)',
        borderTop: isAtivo ? '3px solid var(--primary-accent)' : '3px solid #ef4444',
        backgroundColor: isAtivo ? 'var(--bg-card)' : 'rgba(239, 68, 68, 0.03)',
        position: 'relative',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Topo: Nome, Categoria e Status */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, flex: 1, lineHeight: 1.3 }}>
            {produto.nome}
          </h4>
          <span style={{
            backgroundColor: 'rgba(211,1,1,0.1)',
            color: 'var(--primary-accent)',
            border: '1px solid rgba(211,1,1,0.25)',
            fontSize: '0.72rem',
            padding: '3px 9px',
            borderRadius: '999px',
            fontWeight: 700,
            letterSpacing: '0.3px',
            flexShrink: 0,
            textTransform: 'uppercase'
          }}>
            {produto.categoria}
          </span>
        </div>

        <p style={{
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          margin: 0,
          minHeight: '40px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {produto.descricao || 'Sem descrição cadastrada.'}
        </p>
      </div>

      {/* Rodapé: Preço + Ações */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Preço Unitário
          </span>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: isAtivo ? 'var(--text-main)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            R$ {Number(produto.preco).toFixed(2)}
          </span>
          {!isAtivo && (
            <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
              ⛔ Esgotado hoje
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Botão Pedir Esse (Disponível para Clientes e Visitantes) */}
          {isCliente && (
            <button
              onClick={() => aoPedirItem && aoPedirItem(produto)}
              disabled={!isAtivo || !aberta}
              className="btn-primary hover-scale"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                opacity: (isAtivo && aberta) ? 1 : 0.45,
                cursor: (isAtivo && aberta) ? 'pointer' : 'not-allowed',
                boxShadow: (isAtivo && aberta) ? '0 4px 12px rgba(211, 1, 1, 0.3)' : 'none'
              }}
              title={!aberta ? 'Loja Fechada' : !isAtivo ? 'Item Esgotado' : 'Fazer pedido deste item agora'}
            >
              <ShoppingBag size={14} /> Pedir Esse
            </button>
          )}

          {/* Botão de Pausa Rápida (Toggle Switch para Restaurante/Admin) */}
          {podeEditar && (
            <button
              onClick={() => aoAlternarStatus(produto)}
              disabled={alternandoStatus}
              title={isAtivo ? 'Pausar item (marcar como esgotado hoje)' : 'Reativar item no cardápio'}
              style={{
                backgroundColor: isAtivo ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: `1px solid ${isAtivo ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                color: isAtivo ? '#f87171' : '#34d399',
                borderRadius: '8px',
                padding: '7px 11px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
              }}
            >
              {isAtivo ? 'Pausar' : 'Ativar'}
            </button>
          )}

          {/* Botão de Editar para Perfis ADMIN e RESTAURANTE */}
          {podeEditar && (
            <button
              onClick={() => aoEditar(produto)}
              title="Editar produto"
              style={{
                backgroundColor: 'rgba(211,1,1,0.1)',
                border: '1px solid rgba(211,1,1,0.3)',
                color: 'var(--primary-accent)',
                borderRadius: '8px',
                padding: '7px 11px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(211,1,1,0.2)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(211,1,1,0.1)'}
            >
              <Edit2 size={13} /> Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CardapioView({ usuario, configuracao, aoFazerPedido, aoPedirItem }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('ALL');
  const [pagina, setPagina] = useState(0);
  const [tamanho] = useState(12);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [alternandoStatusId, setAlternandoStatusId] = useState(null);

  const podeEditar = usuario?.perfil === 'ADMIN' || usuario?.perfil === 'RESTAURANTE';
  const isCliente = usuario?.perfil === 'CLIENTE' || !usuario;
  const aberta = configuracao ? configuracao.operacionalmenteAbertaHoje : true;
  const tempoEstimado = configuracao?.tempoEstimadoEntrega || '30-45 min';
  const taxaEntrega = Number(configuracao?.taxaEntregaPadrao ?? 5).toFixed(2);

  const aoAlternarStatus = async (produto) => {
    const novoStatus = produto.ativo === false ? true : false;
    setAlternandoStatusId(produto.id);
    try {
      await servicoProdutos.atualizarStatus(produto.id, novoStatus);
      setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, ativo: novoStatus } : p));
    } catch (err) {
      alert('Erro ao alterar status do produto: ' + (err.message || 'Falha de comunicação'));
    } finally {
      setAlternandoStatusId(null);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, [pagina, categoriaFiltro]);

  const carregarProdutos = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await servicoProdutos.obterTodosPaginado(pagina, tamanho, categoriaFiltro);
      setProdutos(Array.isArray(resp.content) ? resp.content : []);
      setTotalPaginas(resp.totalPages || 1);
      setTotalElementos(resp.totalElements || 0);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar cardápio.');
    } finally {
      setCarregando(false);
    }
  };

  const aoAbrirCriacao = () => {
    setProdutoParaEditar(null);
    setModalAberto(true);
  };

  const aoAbrirEdicao = (produto) => {
    setProdutoParaEditar(produto);
    setModalAberto(true);
  };

  // Filtragem local por termo de busca no array retornado
  const produtosFiltrados = produtos.filter(p => {
    const termo = busca.toLowerCase();
    const bateNome = (p.nome || '').toLowerCase().includes(termo);
    const bateDesc = (p.descricao || '').toLowerCase().includes(termo);
    return bateNome || bateDesc;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Banner de Status Operacional da Loja */}
      {!aberta && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Store size={20} color="#f87171" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.95rem' }}>
                🔴 Estabelecimento Fechado no Momento
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {configuracao?.mensagemFechado || 'Não estamos recebendo pedidos no momento. Consulte o cardápio e volte logo!'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Expediente reinicia automaticamente às 00:00 ou na abertura do turno.
          </span>
        </div>
      )}

      {/* Header do Cardápio com Informações Comerciais */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
        padding: '20px 24px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            backgroundColor: 'rgba(211,1,1,0.12)', border: '1px solid rgba(211,1,1,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UtensilsCrossed size={24} color="var(--primary-accent)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Cardápio de Produtos
              </h2>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                backgroundColor: aberta ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: aberta ? '#34d399' : '#f87171',
                border: `1px solid ${aberta ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}>
                {aberta ? '🟢 Aberto para Pedidos' : '🔴 Loja Fechada'}
              </span>
            </div>
            {/* Badges de Operação: Tempo Estimado e Taxa Fixa */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} color="var(--primary-accent)" /> Tempo de Entrega: <strong style={{ color: 'var(--text-main)' }}>{tempoEstimado}</strong>
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Bike size={14} color="#34d399" /> Taxa Padrão: <strong style={{ color: '#34d399' }}>R$ {taxaEntrega}</strong>
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isCliente && aoFazerPedido && (
            <button
              onClick={aoFazerPedido}
              disabled={!aberta}
              className="btn-primary"
              style={{
                padding: '10px 18px',
                opacity: aberta ? 1 : 0.5,
                cursor: aberta ? 'pointer' : 'not-allowed'
              }}
              title={aberta ? 'Fazer Pedido Agora' : 'Estabelecimento Fechado'}
            >
              <ShoppingBag size={18} /> Fazer Pedido
            </button>
          )}

          {podeEditar && (
            <button onClick={aoAbrirCriacao} className="btn-primary" style={{ padding: '10px 18px' }}>
              <Plus size={18} /> Novo Produto
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        backgroundColor: 'var(--bg-card)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-color)'
      }}>
        {/* Campo de Busca */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text" className="form-input"
            placeholder="Buscar por nome ou ingrediente..."
            value={busca} onChange={e => setBusca(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>

        {/* Filtro por Categoria */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={categoriaFiltro}
            onChange={e => { setCategoriaFiltro(e.target.value); setPagina(0); }}
            className="form-input"
            style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: '10px' }}
          >
            <option value="ALL">Todas as Categorias</option>
            {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <button onClick={carregarProdutos} className="btn-secondary" style={{ padding: '10px 14px' }} title="Atualizar">
            <RefreshCw size={16} className={carregando ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Alerta de Erro */}
      {erro && (
        <div style={{ backgroundColor: 'rgba(211,1,1,0.12)', border: '1px solid rgba(211,1,1,0.35)', color: '#f87171', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} /> {erro}
        </div>
      )}

      {/* Grid de Cards dos Produtos */}
      {carregando ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Carregando cardápio de produtos...
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <UtensilsCrossed size={40} color="var(--text-secondary)" style={{ marginBottom: '12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>Nenhum produto encontrado</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tente alterar a categoria ou o termo de busca.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
          {produtosFiltrados.map(prod => (
            <CardProduto
              key={prod.id}
              produto={prod}
              podeEditar={podeEditar}
              aoEditar={aoAbrirEdicao}
              aoAlternarStatus={aoAlternarStatus}
              alternandoStatus={alternandoStatusId === prod.id}
              aoPedirItem={aoPedirItem}
              aberta={aberta}
              isCliente={isCliente}
            />
          ))}
        </div>
      )}

      {/* Controles de Paginação */}
      <PaginationControls
        paginaAtual={pagina}
        totalPaginas={totalPaginas}
        totalElementos={totalElementos}
        tamanhoPagina={tamanho}
        aoMudarPagina={nova => setPagina(nova)}
      />

      {/* Modal de Cadastro / Edição */}
      {modalAberto && (
        <CadastrarProdutoModal
          produtoParaEditar={produtoParaEditar}
          aoFechar={() => setModalAberto(false)}
          aoSalvarComSucesso={carregarProdutos}
        />
      )}
    </div>
  );
}
