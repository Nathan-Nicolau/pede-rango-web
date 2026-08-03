import React, { useState, useEffect } from 'react';
import { servicoPedidos, servicoClientes, servicoProdutos } from '../services/api';
import { PaginationControls } from './PaginationControls';
import { X, Plus, Minus, Trash2, ShoppingBag, MapPin, User, AlertCircle, Search, ArrowRight, ArrowLeft, CheckCircle2, Tag, UtensilsCrossed } from 'lucide-react';

const CATEGORIAS_CARDAPIO = [
  { id: 'ALL', label: 'Todas as Categorias' },
  { id: 'Lanches', label: '🍔 Lanches' },
  { id: 'Pizzas', label: '🍕 Pizzas' },
  { id: 'Acompanhamentos', label: '🍟 Acompanhamentos' },
  { id: 'Bebidas', label: '🥤 Bebidas' },
  { id: 'Combos', label: '🍱 Combos' },
  { id: 'Sobremesas', label: '🍰 Sobremesas' },
];

export function CreateOrderModal({ aoFechar, aoCriarPedido, usuario }) {
  const isClientePerfil = usuario?.perfil === 'CLIENTE';

  // Passo do Wizard: 1 = Escolha de Itens | 2 = Endereço & Confirmação
  const [passoAtual, setPassoAtual] = useState(1);

  // Estados do Cliente & Entrega
  const [modoCliente, setModoCliente] = useState(isClientePerfil ? 'MANUAL' : 'CADASTRADO');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [nomeCliente, setNomeCliente] = useState(isClientePerfil ? (usuario?.nome || usuario?.email || '') : '');
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [buscaCliente, setBuscaCliente] = useState('');

  // Estados de Dados (Produtos & Clientes)
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregandoClientes, setCarregandoClientes] = useState(!isClientePerfil);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);

  // Filtros & Paginação de Cardápio (Passo 1)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('ALL');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [paginaProdutos, setPaginaProdutos] = useState(0);
  const [tamanhoProdutos, setTamanhoProdutos] = useState(8);
  const [totalPaginasProdutos, setTotalPaginasProdutos] = useState(1);
  const [totalElementosProdutos, setTotalElementosProdutos] = useState(0);

  // Sacola de Compras: Mapa de idProduto -> { produto, quantidade }
  const [sacola, setSacola] = useState({});

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Carrega clientes e dados ao abrir o modal
  useEffect(() => {
    if (!isClientePerfil) {
      carregarClientes();
    } else if (usuario?.email) {
      carregarDadosClienteLogado();
    }
  }, [usuario]);

  // Recarrega os produtos ao mudar de página, tamanho ou categoria
  useEffect(() => {
    carregarProdutos();
  }, [paginaProdutos, tamanhoProdutos, categoriaSelecionada]);

  const carregarDadosClienteLogado = async () => {
    try {
      let clienteData = null;
      try {
        clienteData = await servicoClientes.obterPorEmail(usuario.email);
      } catch {
        const resp = await servicoClientes.obterTodosPaginado(0, 100);
        clienteData = resp?.content?.find(c => c.email === usuario.email || c.nome === usuario.nome);
      }
      if (clienteData) {
        setClienteSelecionado(clienteData);
        if (clienteData.nome) setNomeCliente(clienteData.nome);
        if (clienteData.enderecoPadrao) setEnderecoEntrega(clienteData.enderecoPadrao);
      } else if (usuario) {
        if (usuario.nome) setNomeCliente(usuario.nome);
        if (usuario.enderecoPadrao) setEnderecoEntrega(usuario.enderecoPadrao);
      }
    } catch {
      if (usuario?.nome) setNomeCliente(usuario.nome);
    }
  };

  const carregarClientes = async () => {
    setCarregandoClientes(true);
    try {
      const resp = await servicoClientes.obterTodosPaginado(0, 100);
      setClientes(Array.isArray(resp.content) ? resp.content : []);
    } catch {
      setClientes([]);
    } finally {
      setCarregandoClientes(false);
    }
  };

  const carregarProdutos = async () => {
    setCarregandoProdutos(true);
    try {
      const resp = await servicoProdutos.obterTodosPaginado(paginaProdutos, tamanhoProdutos, categoriaSelecionada);
      const lista = Array.isArray(resp.content)
        ? resp.content.filter(p => p.ativo !== false)
        : [];
      setProdutos(lista);
      setTotalPaginasProdutos(resp.totalPages || 1);
      setTotalElementosProdutos(resp.totalElements || 0);
    } catch {
      setProdutos([]);
    } finally {
      setCarregandoProdutos(false);
    }
  };

  // Funções de manipulação da Sacola no Passo 1
  const alterarQuantidadeProduto = (produto, novaQtd) => {
    const qtd = Math.max(0, parseInt(novaQtd, 10) || 0);
    setSacola(prev => {
      const cop = { ...prev };
      if (qtd <= 0) {
        delete cop[produto.id];
      } else {
        cop[produto.id] = {
          produtoId: produto.id,
          nome: produto.nome,
          precoUnitario: produto.preco,
          quantidade: qtd
        };
      }
      return cop;
    });
  };

  const listaItensSacola = Object.values(sacola);
  const totalItensSacola = listaItensSacola.reduce((acc, item) => acc + item.quantidade, 0);
  const valorTotalSacola = listaItensSacola.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0).toFixed(2);

  // Filtro do Cardápio no Passo 1
  const produtosFiltrados = produtos.filter(p => {
    const batCategoria = categoriaSelecionada === 'ALL' || p.categoria === categoriaSelecionada;
    const batBusca = (p.nome || '').toLowerCase().includes(buscaProduto.toLowerCase()) ||
                     (p.descricao || '').toLowerCase().includes(buscaProduto.toLowerCase());
    return batCategoria && batBusca;
  });

  const aoSelecionarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setNomeCliente(cliente.nome || '');
    setEnderecoEntrega(cliente.enderecoPadrao || '');
  };

  const aoDeselecionarCliente = () => {
    setClienteSelecionado(null);
    setNomeCliente('');
    setEnderecoEntrega('');
    setBuscaCliente('');
  };

  const clientesFiltrados = clientes.filter(c =>
    (c.nome || '').toLowerCase().includes(buscaCliente.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(buscaCliente.toLowerCase())
  );

  // Validação e Envio do Pedido no Passo 2
  const aoSubmeterFinal = async (e) => {
    e.preventDefault();
    setErro(null);

    if (listaItensSacola.length === 0) {
      setErro('Sua sacola está vazia. Adicione pelo menos 1 item no Passo 1.');
      return;
    }

    if (!nomeCliente.trim()) {
      setErro('Informe o nome do cliente.');
      return;
    }

    if (!enderecoEntrega.trim()) {
      setErro('Informe o endereço de entrega.');
      return;
    }

    setCarregando(true);
    try {
      const payload = {
        clienteId: clienteSelecionado ? clienteSelecionado.id : null,
        nomeCliente: modoCliente === 'MANUAL' ? nomeCliente : (clienteSelecionado?.nome || nomeCliente),
        enderecoEntrega: enderecoEntrega.trim(),
        itens: listaItensSacola.map(item => ({
          produtoId: item.produtoId,
          nome: item.nome,
          quantidade: item.quantidade,
          precoUnitario: parseFloat(item.precoUnitario)
        }))
      };

      const novoPedido = await servicoPedidos.criarPedido(payload);
      aoCriarPedido(novoPedido);
      aoFechar();
    } catch (err) {
      setErro(err.message || 'Erro ao criar pedido.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ padding: '16px' }}>
      <div className="modal-content modal-content-xl" style={{ maxWidth: '920px', padding: 0, overflow: 'hidden', borderRadius: '20px' }}>
        
        {/* Cabeçalho do Wizard com Alinhamento em Extremidades Opostas */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{
              background: 'linear-gradient(135deg, #D30101 0%, #9e0000 100%)',
              padding: '10px',
              borderRadius: '12px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(211,1,1,0.3)',
              flexShrink: 0
            }}>
              <ShoppingBag size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                {isClientePerfil ? 'Fazer Novo Pedido' : 'Criar Novo Pedido'}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Passo {passoAtual} de 2 — {passoAtual === 1 ? 'Monte sua Sacola de Compras' : 'Endereço e Confirmação'}
              </span>
            </div>
          </div>

          <button
            onClick={aoFechar}
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 'auto',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Visual de Passos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--bg-input)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div
            onClick={() => setPassoAtual(1)}
            style={{
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              borderBottom: passoAtual === 1 ? '3px solid var(--primary-accent)' : '3px solid transparent',
              backgroundColor: passoAtual === 1 ? 'rgba(211, 1, 1, 0.08)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: passoAtual === 1 ? 'var(--primary-accent)' : 'var(--border-color)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              1
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: passoAtual === 1 ? 'var(--primary-accent)' : 'var(--text-main)' }}>
                Cardápio & Itens
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {totalItensSacola > 0 ? `${totalItensSacola} item(ns) na sacola` : 'Selecione os produtos'}
              </div>
            </div>
          </div>

          <div
            onClick={() => { if (listaItensSacola.length > 0) setPassoAtual(2); }}
            style={{
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: listaItensSacola.length > 0 ? 'pointer' : 'not-allowed',
              opacity: listaItensSacola.length > 0 ? 1 : 0.5,
              borderBottom: passoAtual === 2 ? '3px solid var(--primary-accent)' : '3px solid transparent',
              backgroundColor: passoAtual === 2 ? 'rgba(211, 1, 1, 0.08)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: passoAtual === 2 ? 'var(--primary-accent)' : 'var(--border-color)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              2
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: passoAtual === 2 ? 'var(--primary-accent)' : 'var(--text-main)' }}>
                Entrega & Confirmação
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Endereço e resumo final
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de Erro Geral */}
        {erro && (
          <div style={{
            margin: '16px 24px 0 24px',
            backgroundColor: 'rgba(211, 1, 1, 0.12)',
            border: '1px solid rgba(211, 1, 1, 0.35)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={16} />
            {erro}
          </div>
        )}

        {/* =========================================================================
            PASSO 1: CARDÁPIO INTERATIVO & SELEÇÃO DE ITENS
            ========================================================================= */}
        {passoAtual === 1 && (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '65vh', overflowY: 'auto' }}>
            
            {/* Barra de Filtro por Categoria e Busca */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar produto no cardápio..."
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
                {CATEGORIAS_CARDAPIO.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setCategoriaSelecionada(cat.id); setPaginaProdutos(0); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: categoriaSelecionada === cat.id ? '1px solid var(--primary-accent)' : '1px solid var(--border-color)',
                      backgroundColor: categoriaSelecionada === cat.id ? 'rgba(211, 1, 1, 0.18)' : 'var(--bg-card)',
                      color: categoriaSelecionada === cat.id ? 'var(--primary-accent)' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid do Cardápio de Produtos */}
            {carregandoProdutos ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-secondary)' }}>
                Carregando produtos do cardápio...
              </div>
            ) : produtosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg-input)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <UtensilsCrossed size={36} color="var(--text-secondary)" style={{ marginBottom: '10px', opacity: 0.5 }} />
                <h4 style={{ color: 'var(--text-main)', margin: '0 0 4px 0' }}>Nenhum produto encontrado</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Tente mudar o filtro de categoria ou a busca.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                  {produtosFiltrados.map(prod => {
                    const itemNaSacola = sacola[prod.id];
                    const quantidadeAtual = itemNaSacola ? itemNaSacola.quantidade : 0;

                    return (
                      <div
                        key={prod.id}
                        className="glass-panel"
                        style={{
                          padding: '16px',
                          borderRadius: '14px',
                          border: quantidadeAtual > 0 ? '1px solid var(--primary-accent)' : '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'space-between',
                          gap: '12px',
                          backgroundColor: quantidadeAtual > 0 ? 'rgba(211, 1, 1, 0.04)' : 'var(--bg-card)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                              {prod.nome}
                            </h4>
                            {prod.categoria && (
                              <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-input)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                {prod.categoria}
                              </span>
                            )}
                          </div>
                          {prod.descricao && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {prod.descricao}
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                            R$ {Number(prod.preco || 0).toFixed(2)}
                          </span>

                          {/* Controles de Quantidade */}
                          {quantidadeAtual === 0 ? (
                            <button
                              type="button"
                              onClick={() => alterarQuantidadeProduto(prod, 1)}
                              className="btn-primary"
                              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                            >
                              <Plus size={15} /> Adicionar
                            </button>
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              backgroundColor: 'var(--bg-input)',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              border: '1px solid var(--primary-accent)'
                            }}>
                              <button
                                type="button"
                                onClick={() => alterarQuantidadeProduto(prod, quantidadeAtual - 1)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <Minus size={15} />
                              </button>
                              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary-accent)', minWidth: '18px', textAlign: 'center' }}>
                                {quantidadeAtual}
                              </span>
                              <button
                                type="button"
                                onClick={() => alterarQuantidadeProduto(prod, quantidadeAtual + 1)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <Plus size={15} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <PaginationControls
                  paginaAtual={paginaProdutos}
                  totalPaginas={totalPaginasProdutos}
                  totalElementos={totalElementosProdutos}
                  tamanhoPagina={tamanhoProdutos}
                  aoMudarPagina={(nova) => setPaginaProdutos(nova)}
                  aoMudarTamanho={(novoTamanho) => {
                    setTamanhoProdutos(novoTamanho);
                    setPaginaProdutos(0);
                  }}
                />
              </>
            )}
          </div>
        )}

        {/* =========================================================================
            PASSO 2: ENDEREÇO & CONFIRMAÇÃO DO PEDIDO (Dados do Cliente Fixos)
            ========================================================================= */}
        {passoAtual === 2 && (
          <form onSubmit={aoSubmeterFinal} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '65vh', overflowY: 'auto' }}>
            
            {/* Seção de Dados do Cliente e Endereço */}
            <div style={{ backgroundColor: 'var(--bg-input)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--primary-accent)" /> Endereço de Entrega & Cliente
              </h4>

              {isClientePerfil ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Nome do Cliente (Seu perfil) *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={nomeCliente || usuario?.nome || usuario?.email || 'Cliente'}
                      readOnly
                      style={{ backgroundColor: 'var(--bg-card-hover)', cursor: 'not-allowed', opacity: 0.85, fontWeight: 600 }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Endereço de Entrega *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={enderecoEntrega || clienteSelecionado?.enderecoPadrao || 'Rua das Flores, 123 - Centro'}
                      onChange={e => setEnderecoEntrega(e.target.value)}
                      required
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <button
                      type="button"
                      onClick={() => { setModoCliente('CADASTRADO'); aoDeselecionarCliente(); }}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        backgroundColor: modoCliente === 'CADASTRADO' ? 'rgba(211,1,1,0.15)' : 'transparent',
                        color: modoCliente === 'CADASTRADO' ? 'var(--primary-accent)' : 'var(--text-secondary)',
                      }}>
                      <User size={13} style={{ display: 'inline', marginRight: '4px' }} /> Selecionar Cliente Cadastrado
                    </button>
                    <button
                      type="button"
                      onClick={() => { setModoCliente('MANUAL'); aoDeselecionarCliente(); }}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        backgroundColor: modoCliente === 'MANUAL' ? 'rgba(211,1,1,0.15)' : 'transparent',
                        color: modoCliente === 'MANUAL' ? 'var(--primary-accent)' : 'var(--text-secondary)',
                      }}>
                      ✍️ Digitar Manualmente
                    </button>
                  </div>

                  {modoCliente === 'CADASTRADO' ? (
                    <div>
                      {clienteSelecionado ? (
                        <div style={{
                          backgroundColor: 'var(--bg-card)', padding: '12px', borderRadius: '10px',
                          border: '1px solid rgba(211,1,1,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{clienteSelecionado.nome}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{clienteSelecionado.email} — {clienteSelecionado.telefone}</div>
                          </div>
                          <button type="button" onClick={aoDeselecionarCliente} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                            Trocar
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text" className="form-input"
                            placeholder="Buscar cliente por nome ou e-mail..."
                            value={buscaCliente} onChange={e => setBuscaCliente(e.target.value)}
                            style={{ paddingLeft: '38px', width: '100%' }}
                          />
                          {buscaCliente && (
                            <div style={{
                              maxHeight: '140px', overflowY: 'auto', backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border-color)', borderRadius: '10px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 10, position: 'relative', marginTop: '4px'
                            }}>
                              {clientesFiltrados.map(c => (
                                <div key={c.id} onClick={() => aoSelecionarCliente(c)}
                                  style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.nome}</span> ({c.email})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="form-group" style={{ marginTop: '10px' }}>
                        <label>Endereço de Entrega *</label>
                        <input type="text" className="form-input" placeholder="Ex: Rua das Flores, 123 - Centro"
                          value={enderecoEntrega} onChange={e => setEnderecoEntrega(e.target.value)} required />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label>Nome do Cliente *</label>
                        <input type="text" className="form-input" placeholder="Ex: João da Silva"
                          value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Endereço de Entrega *</label>
                        <input type="text" className="form-input" placeholder="Ex: Av. Paulista, 1000 - Apto 42"
                          value={enderecoEntrega} onChange={e => setEnderecoEntrega(e.target.value)} required />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Resumo da Tabela de Itens */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                Resumo dos Itens Escolhidos ({listaItensSacola.length})
              </h4>
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 14px' }}>Produto</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Qtd</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Unitário</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaItensSacola.map(item => (
                      <tr key={item.produtoId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>{item.nome}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>{item.quantidade}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>R$ {Number(item.precoUnitario).toFixed(2)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--primary-accent)' }}>
                          R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </form>
        )}

        {/* Rodapé Fixo do Modal */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Valor Total do Pedido:</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-accent)', margin: 0 }}>
              R$ {valorTotalSacola}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {passoAtual === 1 ? (
              <>
                <button type="button" className="btn-secondary" onClick={aoFechar}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={listaItensSacola.length === 0}
                  onClick={() => setPassoAtual(2)}
                  style={{ opacity: listaItensSacola.length === 0 ? 0.5 : 1, cursor: listaItensSacola.length === 0 ? 'not-allowed' : 'pointer' }}
                >
                  Avançar para Endereço <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn-secondary" onClick={() => setPassoAtual(1)}>
                  <ArrowLeft size={16} /> Voltar aos Itens
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={carregando}
                  onClick={aoSubmeterFinal}
                >
                  {carregando ? 'Confirmando...' : '🚀 Confirmar e Enviar Pedido'}
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
