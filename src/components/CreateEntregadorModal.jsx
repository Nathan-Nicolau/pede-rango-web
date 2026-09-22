import React, { useState } from 'react';
import { servicoEntregadores } from '../services/api';
import { X, User, Phone, Truck, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export function CreateEntregadorModal({ aoFechar, aoCriarComSucesso }) {
  const [nome, definirNome] = useState('');
  const [email, definirEmail] = useState('');
  const [senha, definirSenha] = useState('');
  const [telefone, definirTelefone] = useState('');
  const [veiculo, definirVeiculo] = useState('Moto');
  const [placa, definirPlaca] = useState('');
  const [mostrarSenha, definirMostrarSenha] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  const aoSubmeter = async (e) => {
    e.preventDefault();
    definirErro(null);

    if (!nome.trim() || !email.trim() || senha.length < 6 || !telefone.trim() || !veiculo.trim()) {
      definirErro('Preencha os campos obrigatórios. A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    definirCarregando(true);

    try {
      const payload = {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        telefone: telefone.trim(),
        veiculo: veiculo.trim(),
        placa: placa.trim() ? placa.trim().toUpperCase() : null
      };

      const novoEntregador = await servicoEntregadores.cadastrar(payload);
      aoCriarComSucesso(novoEntregador);
      aoFechar();
    } catch (err) {
      definirErro(err.message || 'Erro ao cadastrar entregador.');
    } finally {
      definirCarregando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={aoFechar} style={{ padding: '20px' }}>
      <div
        className="modal-content modal-content-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: '12px', color: '#a855f7' }}>
              <Truck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Cadastrar Novo Entregador
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Cria perfil de entregador e conta de acesso associada
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
          <div style={{ backgroundColor: 'rgba(211, 1, 1, 0.15)', border: '1px solid rgba(211, 1, 1, 0.4)', color: '#f87171', padding: '12px 14px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {erro}
          </div>
        )}

        <form onSubmit={aoSubmeter}>
          <div className="form-group">
            <label htmlFor="ent-nome">Nome Completo *</label>
            <input
              id="ent-nome"
              type="text"
              className="form-input"
              placeholder="Ex: João da Silva"
              value={nome}
              onChange={(e) => definirNome(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="ent-email">E-mail de Acesso *</label>
              <input
                id="ent-email"
                type="email"
                className="form-input"
                placeholder="entregador@email.com"
                value={email}
                onChange={(e) => definirEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ent-telefone">Telefone / WhatsApp (Apenas números) *</label>
              <input
                id="ent-telefone"
                type="text"
                inputMode="numeric"
                className="form-input"
                placeholder="11988887777"
                maxLength={11}
                value={telefone}
                onChange={(e) => definirTelefone(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="ent-veiculo">Tipo de Veículo *</label>
              <select
                id="ent-veiculo"
                className="form-input"
                value={veiculo}
                onChange={(e) => definirVeiculo(e.target.value)}
                required
              >
                <option value="Moto">Moto / Scooter</option>
                <option value="Bicicleta">Bicicleta / E-Bike</option>
                <option value="Carro">Carro / Utilitário</option>
                <option value="Patinete">Patinete Elétrico</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ent-placa">Placa (opcional)</label>
              <input
                id="ent-placa"
                type="text"
                className="form-input"
                placeholder="Ex: ABC-1234"
                value={placa}
                onChange={(e) => definirPlaca(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="ent-senha">Senha Inicial (mín. 6 caracteres) *</label>
            <div style={{ position: 'relative' }}>
              <input
                id="ent-senha"
                type={mostrarSenha ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => definirSenha(e.target.value)}
                style={{ paddingRight: '44px', width: '100%' }}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => definirMostrarSenha(!mostrarSenha)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={aoFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={carregando} style={{ backgroundColor: '#a855f7' }}>
              {carregando ? 'Salvando...' : 'Cadastrar Entregador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
