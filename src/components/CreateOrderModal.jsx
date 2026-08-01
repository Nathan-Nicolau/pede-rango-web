import React, { useState } from 'react';
import { orderService } from '../services/api';
import { X, Plus, Trash2, ShoppingBag, MapPin, User, AlertCircle } from 'lucide-react';

export function CreateOrderModal({ onClose, onOrderCreated }) {
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [items, setItems] = useState([
    { name: '', quantity: 1, unitPrice: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, unitPrice: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return acc + qty * price;
    }, 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate items
    for (let i = 0; i < items.length; i++) {
      if (!items[i].name.trim() || !items[i].unitPrice || items[i].quantity <= 0) {
        setError(`Preencha todos os campos do item #${i + 1} corretamente.`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        nomeCliente: customerName,
        enderecoEntrega: deliveryAddress,
        itens: items.map(item => ({
          nome: item.name,
          quantidade: parseInt(item.quantity, 10),
          precoUnitario: parseFloat(item.unitPrice)
        }))
      };

      const newOrder = await orderService.createOrder(payload);
      onOrderCreated(newOrder);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao criar pedido.');
    } finally {
      setLoading(false);
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
              background: 'rgba(249, 115, 22, 0.15)',
              padding: '8px',
              borderRadius: '10px',
              color: 'var(--primary-accent)'
            }}>
              <ShoppingBag size={22} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Criar Novo Pedido</h2>
          </div>
          <button
            onClick={onClose}
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

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
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
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customer-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> Nome do Cliente
            </label>
            <input
              id="customer-name"
              type="text"
              className="form-input"
              placeholder="Ex: Maria Oliveira"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
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
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />
          </div>

          {/* Items Section */}
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
                onClick={handleAddItem}
                style={{
                  background: 'rgba(249, 115, 22, 0.15)',
                  color: 'var(--primary-accent)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
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
              {items.map((item, idx) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr auto',
                  gap: '10px',
                  alignItems: 'center',
                  backgroundColor: '#0f172a',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)'
                }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Hambúrguer Artesanal"
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="Qtd"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="Preço (R$)"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length === 1}
                    className="btn-danger"
                    style={{ opacity: items.length === 1 ? 0.4 : 1, cursor: items.length === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Total summary */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#0f172a',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Valor Total do Pedido:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
              R$ {calculateTotal()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
