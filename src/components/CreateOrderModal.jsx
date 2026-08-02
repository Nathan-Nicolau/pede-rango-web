import React, { useState, useEffect } from 'react';
import { servicoPedidos, servicoClientes, servicoProdutos } from '../services/api';
import { X, Plus, Trash2, ShoppingBag, MapPin, User, AlertCircle, Search, ChevronDown } from 'lucide-react';

export function CreateOrderModal({ aoFechar, aoCriarPedido, usuario }) {
  const isClientePerfil = usuario?.perfil === 'CLIENTE';

  // Modo de cliente: 'CADASTRADO' = selecionar da lista, 'MANUAL' = digitar nome/endereço
  const [modoCliente, setModoCliente] = useState(isClientePerfil ? 'MANUAL' : 'CADASTRADO');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [nomeCliente, setNomeCliente] = useState(isClientePerfil ? (usuario?.nome || usuario?.email || '') : '');
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [buscaCliente, setBuscaCliente] = useState('');

  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregandoClientes, setCarregandoClientes] = useState(!isClientePerfil);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);

  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Carrega clientes e produtos ao abrir o modal
  useEffect(() => {
    if (!isClientePerfil) {
      carregarClientes();
    }
    carregarProdutos();
  }, [usuario]);

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
      const resp = await servicoProdutos.obterTodosPaginado(0, 100);
      // Filtrar apenas ativos
      const lista = Array.isArray(resp.content)
        ? resp.content.filter(p => p.ativo !== false)
        : [];
      setProdutos(lista);

      // Inicializa primeiro item se a lista estiver preenchida
      if (lista.length > 0) {
        setItens([{
          produtoId: lista[0].id,
          nome: lista[0].nome,
          quantidade: 1,
          precoUnitario: lista[0].preco,
        }]);
      }
    } catch {
      setProdutos([]);
    } finally {
      setCarregandoProdutos(false);
    }
  };

  // Ao selecionar um cliente, preenche nome e endereço automaticamente
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

  // Seleciona um produto no item[idx] (EXCLUSIVAMENTE do cardápio pré-existente)
  const aoSelecionarProduto = (idx, produtoId) => {
    const produto = produtos.find(p => String(p.id) === String(produtoId));
    if (produto) {
      const novosItens = [...itens];
      novosItens[idx] = {
        produtoId: produto.id,
        nome: produto.nome,
        quantidade: novosItens[idx]?.quantidade || 1,
        precoUnitario: produto.preco,
      };
      setItens(novosItens);
    }
  };

  const aoAlterarQuantidade = (idx, qtdValor) => {
    const qtd = Math.max(1, parseInt(qtdValor, 10) || 1);
    const novosItens = [...itens];
    novosItens[idx].quantidade = qtd;
    setItens(novosItens);
  };

  const aoAdicionarItem = () => {
    const primeiro = produtos.length > 0 ? produtos[0] : null;
    if (!primeiro) return;

    setItens([...itens, {
      produtoId: primeiro.id,
      nome: primeiro.nome,
      quantidade: 1,
      precoUnitario: primeiro.preco,
    }]);
  };

  const aoRemoverItem = (idx) => {
    if (itens.length === 1) return;
    setItens(itens.filter((_, i) => i !== idx));
  };

  const calcularTotal = () => {
    return itens.reduce((acc, item) => {
      const qtd = parseFloat(item.quantidade) || 0;
      const preco = parseFloat(item.precoUnitario) || 0;
      return acc + (qtd * preco);
    }, 0).toFixed(2);
  };

  const aoSubmeter = async (e) => {
    e.preventDefault();
    setErro(null);

    if (itens.length === 0) {
      setErro('Adicione pelo menos 1 item ao pedido.');
      return;
    }

    for (let i = 0; i < itens.length; i++) {
      if (!itens[i].produtoId || Number(itens[i].quantidade) <= 0) {
        setErro(`Selecione um produto e uma quantidade válida para o item #${i + 1}.`);
        return;
      }
    }

    if (modoCliente === 'MANUAL' && !nomeCliente.trim()) {
      setErro('Informe o nome do cliente.');
      return;
    }

    setCarregando(true);
    try {
      const payload = {
        clienteId: clienteSelecionado ? clienteSelecionado.id : null,
        nomeCliente: modoCliente === 'MANUAL' ? nomeCliente : (clienteSelecionado?.nome || nomeCliente),
        enderecoEntrega,
        itens: itens.map(item => ({
          produtoId: item.produtoId,
          nome: item.nome,
          quantidade: parseInt(item.quantidade, 10),
          precoUnitario: parseFloat(item.precoUnitario),
        })),
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

  const clientesFiltrados = clientes.filter(c =>
    (c.nome || '').toLowerCase().includes(buscaCliente.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(buscaCliente.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-xl">
        {/* Cabeçalho */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '22px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(211,1,1,0.15)', padding: '8px', borderRadius: '10px', color: 'var(--primary-accent)' }}>
              <ShoppingBag size={22} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Criar Novo Pedido</h2>
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
          <div style={{
            backgroundColor: 'rgba(211, 1, 1, 0.12)',
            border: '1px solid rgba(211, 1, 1, 0.35)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={16} />
            {erro}
          </div>
        )}

        <form onSubmit={aoSubmeter}>

          {/* ── SEÇÃO: IDENTIFICAÇÃO DO CLIENTE ── */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem', display: 'block', marginBottom: '10px' }}>
              Dados do Cliente & Entrega
            </label>

            {isClientePerfil ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Nome do Cliente *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={nomeCliente}
                    readOnly
                    style={{ backgroundColor: 'var(--bg-card-hover)', cursor: 'not-allowed', opacity: 0.8 }}
                  />
                </div>

                <div className="form-group">
                  <label>Endereço de Entrega *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Av. Paulista, 1000 - Apto 42, São Paulo"
                    value={enderecoEntrega}
                    onChange={e => setEnderecoEntrega(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <button
                    type="button"
                    onClick={() => { setModoCliente('CADASTRADO'); aoDeselecionarCliente(); }}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
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
                      padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
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
                        backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: '10px',
                        border: '1px solid rgba(211,1,1,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{clienteSelecionado.nome}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{clienteSelecionado.email} — {clienteSelecionado.telefone}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--primary-accent)', marginTop: '2px' }}>
                            <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            {clienteSelecionado.enderecoPadrao || 'Sem endereço padrão'}
                          </div>
                        </div>
                        <button type="button" onClick={aoDeselecionarCliente} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Trocar Cliente
                        </button>
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'relative', marginBottom: '8px' }}>
                          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text" className="form-input"
                            placeholder={carregandoClientes ? "Carregando lista de clientes..." : "Buscar cliente cadastrado por nome ou e-mail..."}
                            value={buscaCliente} onChange={e => setBuscaCliente(e.target.value)}
                            disabled={carregandoClientes}
                            style={{ paddingLeft: '38px', width: '100%' }}
                          />
                        </div>

                        {buscaCliente && (
                          <div style={{
                            maxHeight: '160px', overflowY: 'auto', backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)', borderRadius: '10px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 10, position: 'relative'
                          }}>
                            {clientesFiltrados.length === 0 ? (
                              <div style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                Nenhum cliente encontrado.
                              </div>
                            ) : (
                              clientesFiltrados.map(c => (
                                <div key={c.id} onClick={() => aoSelecionarCliente(c)}
                                  style={{
                                    padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)',
                                    fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.nome}</span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>({c.email})</span>
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-accent)' }}>Selecionar ➔</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="form-group" style={{ marginTop: '12px' }}>
                      <label htmlFor="modal-order-address-selected">Endereço de Entrega *</label>
                      <input id="modal-order-address-selected" type="text" className="form-input"
                        placeholder="Ex: Rua das Flores, 123 - Centro"
                        value={enderecoEntrega} onChange={e => setEnderecoEntrega(e.target.value)} required />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label htmlFor="modal-order-custname">Nome do Cliente *</label>
                      <input id="modal-order-custname" type="text" className="form-input"
                        placeholder="Ex: João da Silva"
                        value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="modal-order-address-manual">Endereço de Entrega *</label>
                      <input id="modal-order-address-manual" type="text" className="form-input"
                        placeholder="Ex: Av. Paulista, 1000 - Apto 42, São Paulo"
                        value={enderecoEntrega} onChange={e => setEnderecoEntrega(e.target.value)} required />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── SEÇÃO: ITENS DO PEDIDO (APENAS PRODUTOS DO CARDÁPIO, PREÇO FIXO NÃO EDITÁVEL) ── */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Itens do Pedido (Cardápio Oficial)
              </label>
              <button
                type="button"
                onClick={aoAdicionarItem}
                disabled={produtos.length === 0}
                style={{
                  background: 'rgba(211,1,1,0.15)', color: 'var(--primary-accent)',
                  border: '1px solid rgba(211,1,1,0.3)', borderRadius: '8px',
                  padding: '6px 12px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Plus size={16} /> Adicionar Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {itens.map((item, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'var(--bg-input)', padding: '14px',
                  borderRadius: '12px', border: '1px solid var(--border-color)',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr auto', gap: '12px', alignItems: 'center' }}>
                    {/* Select do cardápio real (Sem item personalizado) */}
                    <select
                      className="form-input"
                      value={item.produtoId !== null ? String(item.produtoId) : ''}
                      onChange={e => aoSelecionarProduto(idx, e.target.value)}
                      style={{ padding: '10px 12px', cursor: 'pointer', fontWeight: 600 }}
                      required
                    >
                      {carregandoProdutos ? (
                        <option disabled>Carregando cardápio...</option>
                      ) : produtos.length === 0 ? (
                        <option disabled>Nenhum produto disponível no cardápio</option>
                      ) : (
                        produtos.map(p => (
                          <option key={p.id} value={String(p.id)}>
                            {p.nome} — R$ {Number(p.preco).toFixed(2)}
                          </option>
                        ))
                      )}
                    </select>

                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      placeholder="Qtd"
                      value={item.quantidade}
                      onChange={e => aoAlterarQuantidade(idx, e.target.value)}
                      required
                    />

                    {/* Preço Unitário Não Editável (Fixo do Cardápio) */}
                    <div style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontWeight: 700,
                      color: 'var(--primary-accent)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      userSelect: 'none'
                    }} title="Preço unitário fixo do cardápio (não alterável)">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Preço:</span>
                      <span>R$ {Number(item.precoUnitario || 0).toFixed(2)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => aoRemoverItem(idx)}
                      disabled={itens.length === 1}
                      className="btn-danger"
                      style={{ opacity: itens.length === 1 ? 0.4 : 1, cursor: itens.length === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo do Total */}
          <div style={{
            backgroundColor: 'var(--bg-input)', padding: '16px 20px', borderRadius: '12px',
            border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '24px'
          }}>
            <span style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem' }}>
              Valor Total do Pedido:
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
              R$ {calcularTotal()}
            </span>
          </div>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={aoFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={carregando || itens.length === 0}>
              {carregando ? 'Criando Pedido...' : 'Confirmar Pedido'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
