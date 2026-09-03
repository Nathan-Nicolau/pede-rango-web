import React, { useState, useEffect } from 'react';
import { servicoProdutos } from '../services/api';
import { PaginationControls } from './PaginationControls';
import {
  UtensilsCrossed, Plus, Search, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Edit2, X
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
              <input id="prod-preco" type="number" step="0.01" min="0.01" className="form-input"
                placeholder="Ex: 29.90"
                value={preco} onChange={e => setPreco(e.target.value)} required />
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

// ─── Card do Produto ──────────────────────────────────────────────────────────
function CardProduto({ produto, podeEditar, aoEditar }) {
  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        gap: '16px',
        opacity: produto.ativo ? 1 : 0.65,
        transition: 'opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
        borderLeft: produto.ativo ? '3px solid var(--primary-accent)' : '3px solid var(--border-color)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
    >
      {/* Topo: nome + categoria */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '10px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, flex: 1, lineHeight: 1.3 }}>
            {produto.nome}
          </h4>
          <span style={{
            backgroundColor: 'rgba(211,1,1,0.15)', color: 'var(--primary-accent)',
            border: '1px solid rgba(211,1,1,0.3)', fontSize: '0.75rem',
            padding: '3px 10px', borderRadius: '999px', fontWeight: 600, flexShrink: 0,
          }}>
            {produto.categoria}
          </span>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
          {produto.descricao || 'Sem descrição cadastrada.'}
        </p>
      </div>

      {/* Rodapé: preço + status + botão editar */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '14px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'nowrap'
      }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-accent)', whiteSpace: 'nowrap' }}>
          R$ {Number(produto.preco).toFixed(2)}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Badge status */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
            backgroundColor: produto.ativo ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: produto.ativo ? '#34d399' : '#f87171',
            border: `1px solid ${produto.ativo ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
            whiteSpace: 'nowrap',
          }}>
            {produto.ativo ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {produto.ativo ? 'Ativo' : 'Inativo'}
          </span>

          {/* Botão de Editar para Perfis ADMIN e RESTAURANTE */}
          {podeEditar && (
            <button
              onClick={() => aoEditar(produto)}
              title="Editar produto"
              style={{
                backgroundColor: 'rgba(211,1,1,0.12)',
                border: '1px solid rgba(211,1,1,0.3)',
                color: 'var(--primary-accent)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(211,1,1,0.22)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(211,1,1,0.12)'}
            >
              <Edit2 size={14} /> Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export function CardapioView({ usuario }) {
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

  const podeEditar = usuario?.perfil === 'ADMIN' || usuario?.perfil === 'RESTAURANTE';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header do Cardápio */}
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
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Cardápio de Produtos
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Consulte itens disponíveis e pratos do menu oficial.
            </p>
          </div>
        </div>

        {podeEditar && (
          <button onClick={aoAbrirCriacao} className="btn-primary" style={{ padding: '10px 18px' }}>
            <Plus size={18} /> Novo Produto
          </button>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        backgroundColor: 'var(--bg-card)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-color)'
      }}>
        {/* Campo de Busca */}
        <div className="search-input-wrapper" style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
          <input
            type="text" className="search-input-with-icon form-input"
            placeholder="Buscar por nome ou ingrediente..."
            value={busca} onChange={e => setBusca(e.target.value)}
            style={{ paddingLeft: '42px', width: '100%' }}
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
