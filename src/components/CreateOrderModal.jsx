import React, { useState } from 'react';
import { servicoPedidos } from '../services/api';
import { X, Plus, Trash2, ShoppingBag, MapPin, User, AlertCircle } from 'lucide-react';

export function CreateOrderModal({ aoFechar, aoCriarPedido }) {
  const [nomeCliente, definirNomeCliente] = useState('');
  const [enderecoEntrega, definirEnderecoEntrega] = useState('');
  const [itens, definirItens] = useState([
    { nome: '', quantidade: 1, precoUnitario: '' }
  ]);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  const aoAdicionarItem = () => {
    definirItens([...itens, { nome: '', quantidade: 1, precoUnitario: '' }]);
  };

  const aoRemoverItem = (indice) => {
    if (itens.length === 1) return;
    definirItens(itens.filter((_, i) => i !== indice));
  };

  const aoAlterarItem = (indice, campo, valor) => {
    const novosItens = [...itens];
    novosItens[indice][campo] = valor;
    definirItens(novosItens);
  };

  const calcularTotal = () => {
    return itens.reduce((acc, item) => {
      const qtd = parseFloat(item.quantidade) || 0;
      const preco = parseFloat(item.precoUnitario) || 0;
      return acc + qtd * preco;
    }, 0).toFixed(2);
  };

  const aoSubmeter = async (e) => {
    e.preventDefault();
    definirErro(null);

    // Validação dos itens
    for (let i = 0; i < itens.length; i++) {
      if (!itens[i].nome.trim() || !itens[i].precoUnitario || itens[i].quantidade <= 0) {
        definirErro(`Preencha todos os campos do item #${i + 1} corretamente.`);
        return;
      }
    }

    definirCarregando(true);

    try {
      const payload = {
        nomeCliente,
        enderecoEntrega,
        itens: itens.map(item => ({
          nome: item.nome,
          quantidade: parseInt(item.quantidade, 10),
          precoUnitario: parseFloat(item.precoUnitario)
        }))
      };

      const novoPedido = await servicoPedidos.criarPedido(payload);
      aoCriarPedido(novoPedido);
      aoFechar();
    } catch (err) {
      definirErro(err.message || 'Erro ao criar pedido.');
    } finally {
      definirCarregando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(211, 1, 1, 0.15)',
              padding: '8px',
              borderRadius: '10px',
              color: 'var(--primary-accent)'
            }}>
              <ShoppingBag size={22} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Criar Novo Pedido</h2>
          </div>
          <button
            onClick={aoFechar}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {erro && (
          <div style={{
            backgroundColor: 'rgba(211, 1, 1, 0.15)',
            border: '1px solid rgba(211, 1, 1, 0.4)',
            color: '#f87171',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '0.875rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={aoSubmeter}>
          <div className="form-group">
            <label htmlFor="customer-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> Nome do Cliente
            </label>
            <input
              id="customer-name"
              type="text"
              className="form-input"
              placeholder="Ex: Maria Oliveira"
              value={nomeCliente}
              onChange={(e) => definirNomeCliente(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="delivery-address" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> Endereço de Entrega
            </label>
            <input
              id="delivery-address"
              type="text"
              className="form-input"
              placeholder="Ex: Av. Paulista, 1000 - Apto 42, São Paulo"
              value={enderecoEntrega}
              onChange={(e) => definirEnderecoEntrega(e.target.value)}
              required
            />
          </div>

          {/* Seção de Itens */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Itens do Pedido
              </label>
              <button
                type="button"
                onClick={aoAdicionarItem}
                style={{
                  background: 'rgba(211, 1, 1, 0.15)',
                  color: 'var(--primary-accent)',
                  border: '1px solid rgba(211, 1, 1, 0.3)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={16} /> Adicionar Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {itens.map((item, idx) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr auto',
                  gap: '10px',
                  alignItems: 'center',
                  backgroundColor: '#141417',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)'
                }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Hambúrguer Artesanal"
                    value={item.nome}
                    onChange={(e) => aoAlterarItem(idx, 'nome', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="Qtd"
                    value={item.quantidade}
                    onChange={(e) => aoAlterarItem(idx, 'quantidade', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="Preço (R$)"
                    value={item.precoUnitario}
                    onChange={(e) => aoAlterarItem(idx, 'precoUnitario', e.target.value)}
                    required
                  />
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
              ))}
            </div>
          </div>

          {/* Resumo do Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#141417',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Valor Total do Pedido:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
              R$ {calcularTotal()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={aoFechar} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
