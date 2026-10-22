import React, { useState, useEffect } from 'react';
import { servicoConfiguracoes } from '../services/api';
import { Store, Clock, DollarSign, QrCode, Phone, CheckCircle2, AlertCircle, PlayCircle, StopCircle, PauseCircle, Save, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

export function StoreConfigView({ aoAtualizarConfig }) {
  const [config, setConfig] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [erro, setErro] = useState(null);

  // Estados do formulário de abertura de expediente
  const [modalAbrirDia, setModalAbrirDia] = useState(false);
  const [taxaDia, setTaxaDia] = useState('5.00');
  const [tempoMinDia, setTempoMinDia] = useState('30');
  const [tempoMaxDia, setTempoMaxDia] = useState('45');

  // Estados do formulário geral
  const [nomeLoja, setNomeLoja] = useState('');
  const [telefoneContato, setTelefoneContato] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [taxaPadrao, setTaxaPadrao] = useState('5.00');
  const [tempoMinPadrao, setTempoMinPadrao] = useState('30');
  const [tempoMaxPadrao, setTempoMaxPadrao] = useState('45');

  const carregarConfiguracoes = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await servicoConfiguracoes.obter();
      setConfig(dados);
      setNomeLoja(dados.nomeLoja || 'Pede Rango Delivery');
      setTelefoneContato(dados.telefoneContato || '');
      setChavePix(dados.chavePix || '');
      setTaxaPadrao(dados.taxaEntregaPadrao != null ? dados.taxaEntregaPadrao.toString() : '5.00');
      setTempoMinPadrao(dados.tempoEstimadoMinMinutos != null ? dados.tempoEstimadoMinMinutos.toString() : '30');
      setTempoMaxPadrao(dados.tempoEstimadoMaxMinutos != null ? dados.tempoEstimadoMaxMinutos.toString() : '45');
      
      setTaxaDia(dados.taxaEntregaPadrao != null ? dados.taxaEntregaPadrao.toString() : '5.00');
      setTempoMinDia(dados.tempoEstimadoMinMinutos != null ? dados.tempoEstimadoMinMinutos.toString() : '30');
      setTempoMaxDia(dados.tempoEstimadoMaxMinutos != null ? dados.tempoEstimadoMaxMinutos.toString() : '45');

      if (aoAtualizarConfig) aoAtualizarConfig(dados);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar configurações do estabelecimento');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const aoIniciarExpediente = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const dadosAtualizados = await servicoConfiguracoes.abrirExpediente({
        taxaEntregaPadrao: parseFloat(taxaDia) || 5.0,
        tempoEstimadoMinMinutos: parseInt(tempoMinDia, 10) || 30,
        tempoEstimadoMaxMinutos: parseInt(tempoMaxDia, 10) || 45,
      });
      setConfig(dadosAtualizados);
      setModalAbrirDia(false);
      setMensagemSucesso('🚀 Expediente do dia iniciado com sucesso! A loja está pronta para receber pedidos.');
      setTimeout(() => setMensagemSucesso(null), 4000);
      if (aoAtualizarConfig) aoAtualizarConfig(dadosAtualizados);
    } catch (err) {
      setErro(err.message || 'Erro ao iniciar expediente');
    } finally {
      setSalvando(false);
    }
  };

  const aoEncerrarExpediente = async () => {
    if (!window.confirm('Tem certeza que deseja encerrar o expediente de hoje? Nenhum novo pedido poderá ser criado até a reabertura.')) {
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const dadosAtualizados = await servicoConfiguracoes.fecharExpediente();
      setConfig(dadosAtualizados);
      setMensagemSucesso('🛑 Expediente encerrado. A loja está fechada para novos pedidos.');
      setTimeout(() => setMensagemSucesso(null), 4000);
      if (aoAtualizarConfig) aoAtualizarConfig(dadosAtualizados);
    } catch (err) {
      setErro(err.message || 'Erro ao encerrar expediente');
    } finally {
      setSalvando(false);
    }
  };

  const aoAlternarStatus = async () => {
    setSalvando(true);
    setErro(null);
    try {
      const dadosAtualizados = await servicoConfiguracoes.alternarStatus();
      setConfig(dadosAtualizados);
      setMensagemSucesso(`Status da loja alterado para: ${dadosAtualizados.operacionalmenteAbertaHoje ? '🟢 Aberta' : '🔴 Fechada/Pausada'}`);
      setTimeout(() => setMensagemSucesso(null), 4000);
      if (aoAtualizarConfig) aoAtualizarConfig(dadosAtualizados);
    } catch (err) {
      setErro(err.message || 'Erro ao alterar status da loja');
    } finally {
      setSalvando(false);
    }
  };

  const aoSalvarParametros = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const dadosAtualizados = await servicoConfiguracoes.atualizar({
        nomeLoja: nomeLoja.trim(),
        telefoneContato: telefoneContato.trim(),
        chavePix: chavePix.trim(),
        taxaEntregaPadrao: parseFloat(taxaPadrao) || 0.0,
        tempoEstimadoMinMinutos: parseInt(tempoMinPadrao, 10) || 30,
        tempoEstimadoMaxMinutos: parseInt(tempoMaxPadrao, 10) || 45,
      });
      setConfig(dadosAtualizados);
      setMensagemSucesso('✔ Parâmetros gerais do estabelecimento atualizados com sucesso!');
      setTimeout(() => setMensagemSucesso(null), 4000);
      if (aoAtualizarConfig) aoAtualizarConfig(dadosAtualizados);
    } catch (err) {
      setErro(err.message || 'Erro ao atualizar parâmetros');
    } finally {
      setSalvando(false);
    }
  };

  const formatarDataHora = (iso) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const expedienteIniciado = Boolean(config?.expedienteIniciadoHoje);
  const lojaRecebendo = Boolean(config?.lojaAberta && expedienteIniciado);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header do Painel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Store size={26} color="var(--primary-accent)" /> Operações & Parâmetros da Loja
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Controle de abertura/fechamento diário, taxa de entrega padrão e configurações comerciais
          </p>
        </div>

        <button
          type="button"
          onClick={carregarConfiguracoes}
          className="btn-secondary"
          disabled={carregando}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px' }}
        >
          <RefreshCw size={16} className={carregando ? 'spin' : ''} />
          {carregando ? 'Atualizando...' : 'Atualizar Painel'}
        </button>
      </div>

      {/* Alertas */}
      {mensagemSucesso && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#10b981', padding: '12px 18px', borderRadius: '12px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} /> {mensagemSucesso}
        </div>
      )}
      {erro && (
        <div style={{ backgroundColor: 'rgba(211, 1, 1, 0.12)', border: '1px solid rgba(211, 1, 1, 0.35)', color: '#f87171', padding: '12px 18px', borderRadius: '12px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} /> {erro}
        </div>
      )}

      {/* Card de Controle de Expediente Diário */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          border: lojaRecebendo
            ? '1px solid rgba(16, 185, 129, 0.4)'
            : expedienteIniciado
            ? '1px solid rgba(245, 158, 11, 0.4)'
            : '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: lojaRecebendo
                ? 'rgba(16, 185, 129, 0.15)'
                : expedienteIniciado
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(211, 1, 1, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: lojaRecebendo ? '#10b981' : expedienteIniciado ? '#f59e0b' : '#f87171',
              boxShadow: lojaRecebendo
                ? '0 0 16px rgba(16, 185, 129, 0.25)'
                : expedienteIniciado
                ? '0 0 16px rgba(245, 158, 11, 0.25)'
                : 'none',
              flexShrink: 0
            }}>
              {lojaRecebendo ? <Sparkles size={24} /> : expedienteIniciado ? <PauseCircle size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Status da Operação: {lojaRecebendo ? '🟢 Loja Aberta' : expedienteIniciado ? '🟡 Recebimento Pausado' : '🔴 Loja Fechada'}
                </h3>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: lojaRecebendo
                    ? 'rgba(16, 185, 129, 0.15)'
                    : expedienteIniciado
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(211, 1, 1, 0.15)',
                  color: lojaRecebendo ? '#10b981' : expedienteIniciado ? '#fbbf24' : '#f87171',
                  border: `1px solid ${lojaRecebendo ? 'rgba(16, 185, 129, 0.3)' : expedienteIniciado ? 'rgba(245, 158, 11, 0.3)' : 'rgba(211, 1, 1, 0.3)'}`
                }}>
                  {lojaRecebendo ? 'RECEBENDO PEDIDOS' : expedienteIniciado ? 'PAUSADO TEMPORARIAMENTE' : 'EXPEDIENTE NÃO INICIADO / ENCERRADO'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {lojaRecebendo
                  ? `Expediente iniciado em ${formatarDataHora(config?.abertoEm)} • Pedidos de clientes permitidos.`
                  : expedienteIniciado
                  ? `Expediente aberto hoje (${formatarDataHora(config?.abertoEm)}), porém o recebimento de novos pedidos está pausado.`
                  : 'Nenhum pedido pode ser feito até que o expediente do dia seja iniciado.'}
              </p>
            </div>
          </div>

          {/* Botões de Controle */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {!expedienteIniciado ? (
              <button
                type="button"
                onClick={() => setModalAbrirDia(true)}
                className="btn-primary"
                style={{
                  backgroundColor: '#10b981',
                  padding: '12px 22px',
                  fontSize: '0.92rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                <PlayCircle size={18} /> Iniciar Dia de Trabalho
              </button>
            ) : lojaRecebendo ? (
              <>
                <button
                  type="button"
                  onClick={aoAlternarStatus}
                  disabled={salvando}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <PauseCircle size={17} color="#fbbf24" /> Pausar Recebimento
                </button>
                <button
                  type="button"
                  onClick={aoEncerrarExpediente}
                  disabled={salvando}
                  className="btn-primary"
                  style={{
                    backgroundColor: '#D30101',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <StopCircle size={17} /> Encerrar Expediente
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={aoAlternarStatus}
                  disabled={salvando}
                  className="btn-primary"
                  style={{
                    backgroundColor: '#10b981',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <PlayCircle size={17} /> Retomar Recebimento
                </button>
                <button
                  type="button"
                  onClick={aoEncerrarExpediente}
                  disabled={salvando}
                  className="btn-secondary"
                  style={{
                    borderColor: 'rgba(211, 1, 1, 0.4)',
                    color: '#f87171',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <StopCircle size={17} /> Encerrar Expediente
                </button>
              </>
            )}
          </div>
        </div>

        {/* Informações Atuais de Operação */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={14} color="var(--primary-accent)" /> Taxa de Entrega Atual
            </span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'block', marginTop: '4px' }}>
              R$ {Number(config?.taxaEntregaPadrao || 0).toFixed(2)}
            </strong>
          </div>

          <div style={{ backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#38bdf8" /> Tempo Estimado de Entrega
            </span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'block', marginTop: '4px' }}>
              {config?.tempoEstimadoMinMinutos || 30} a {config?.tempoEstimadoMaxMinutos || 45} min
            </strong>
          </div>

          <div style={{ backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#a855f7" /> Regra da Meia-Noite
            </span>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginTop: '4px' }}>
              Reset Automático às 00:00
            </strong>
          </div>
        </div>
      </div>

      {/* Formulário de Parâmetros Gerais e Comerciais */}
      <form onSubmit={aoSalvarParametros} className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={20} color="var(--primary-accent)" /> Parâmetros Comerciais & Formas de Recebimento
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          
          {/* Nome da Loja */}
          <div className="form-group">
            <label htmlFor="config-nome-loja" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Nome do Estabelecimento *</label>
            <input
              id="config-nome-loja"
              type="text"
              className="form-input"
              value={nomeLoja}
              onChange={e => setNomeLoja(e.target.value)}
              placeholder="Ex: Pede Rango Delivery"
              required
            />
          </div>

          {/* Telefone / WhatsApp do Estabelecimento */}
          <div className="form-group">
            <label htmlFor="config-telefone" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} color="#10b981" /> Telefone / WhatsApp da Loja
            </label>
            <input
              id="config-telefone"
              type="text"
              inputMode="numeric"
              className="form-input"
              value={telefoneContato}
              onChange={e => setTelefoneContato(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 11987654321"
              maxLength={11}
            />
          </div>

          {/* Chave PIX Padrão */}
          <div className="form-group">
            <label htmlFor="config-chave-pix" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <QrCode size={14} color="#38bdf8" /> Chave PIX do Estabelecimento
            </label>
            <input
              id="config-chave-pix"
              type="text"
              className="form-input"
              value={chavePix}
              onChange={e => setChavePix(e.target.value)}
              placeholder="Ex: financeiro@pederango.com ou CNPJ/Telefone"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
              Esta chave será exibida automaticamente aos clientes no checkout com opção de copiar.
            </span>
          </div>

          {/* Taxa de Entrega Padrão */}
          <div className="form-group">
            <label htmlFor="config-taxa-padrao" style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={14} color="var(--primary-accent)" /> Taxa de Entrega Fixa Padrão (R$) *
            </label>
            <input
              id="config-taxa-padrao"
              type="text"
              inputMode="decimal"
              className="form-input"
              value={taxaPadrao}
              onChange={e => setTaxaPadrao(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))}
              placeholder="5.00"
              required
            />
          </div>

          {/* Tempo Estimado Min e Max */}
          <div className="form-group">
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#fbbf24" /> Tempo Estimado de Entrega (Minutos) *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  value={tempoMinPadrao}
                  onChange={e => setTempoMinPadrao(e.target.value.replace(/\D/g, ''))}
                  placeholder="Mín: 30"
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Mínimo (min)</span>
              </div>
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  value={tempoMaxPadrao}
                  onChange={e => setTempoMaxPadrao(e.target.value.replace(/\D/g, ''))}
                  placeholder="Máx: 45"
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Máximo (min)</span>
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="submit"
            disabled={salvando}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* Modal: Iniciar Dia de Trabalho */}
      {modalAbrirDia && (
        <div className="modal-overlay" onClick={() => setModalAbrirDia(false)} style={{ padding: '20px' }}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '100%',
              borderRadius: '24px',
              padding: '32px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  flexShrink: 0
                }}
              >
                <PlayCircle size={26} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.2 }}>
                  Iniciar Dia de Trabalho
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.35 }}>
                  Confirme os parâmetros operacionais para abrir as vendas de hoje
                </p>
              </div>
            </div>

            <form onSubmit={aoIniciarExpediente} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>Taxa de Entrega de Hoje (R$) *</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="form-input"
                  value={taxaDia}
                  onChange={e => setTaxaDia(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))}
                  placeholder="5.00"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>Tempo Estimado de Entrega de Hoje (Minutos) *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Tempo Mínimo (min):
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-input"
                      value={tempoMinDia}
                      onChange={e => setTempoMinDia(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 30"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Tempo Máximo (min):
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-input"
                      value={tempoMaxDia}
                      onChange={e => setTempoMaxDia(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 45"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                💡 <strong>Dica Operacional:</strong> A qualquer momento do dia você poderá pausar o recebimento caso a cozinha fique sobrecarregada, e retomar quando quiser.
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setModalAbrirDia(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', backgroundColor: '#10b981', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
                >
                  <PlayCircle size={18} /> {salvando ? 'Abrindo...' : 'Abrir Operações'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
