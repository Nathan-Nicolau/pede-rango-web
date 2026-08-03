/**
 * Utilitário centralizado para mapear enums da API para textos legíveis na UI.
 * Evita exibir strings de enum brutas para o usuário final e impõe regras de fluxo.
 */

// StatusPedido → Label legível
export const STATUS_PEDIDO_LABELS = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em Preparo',
  PRONTO_PARA_ENTREGA: 'Pronto para Entrega',
  SAIU_PARA_ENTREGA: 'Saiu para Entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

// MotivoCancelamento → Label legível
export const MOTIVO_CANCELAMENTO_LABELS = {
  DESISTENCIA_CLIENTE: 'Desistência do Cliente',
  ENDERECO_NAO_ENCONTRADO: 'Endereço não Encontrado',
  FALTA_DE_ESTOQUE: 'Falta de Estoque',
  ATRASO_NA_ENTREGA: 'Atraso na Entrega',
  OUTRO: 'Outro',
};

// PerfilUsuario → Label legível
export const PERFIL_USUARIO_LABELS = {
  CLIENTE: 'Cliente',
  ENTREGADOR: 'Entregador',
  RESTAURANTE: 'Restaurante',
  ADMIN: 'Administrador',
};

/**
 * Retorna o label legível de um status de pedido.
 */
export function labelStatus(status) {
  return STATUS_PEDIDO_LABELS[status] || status || '-';
}

/**
 * Retorna o label legível de um motivo de cancelamento.
 */
export function labelMotivoCancelamento(motivo) {
  return MOTIVO_CANCELAMENTO_LABELS[motivo] || motivo || '-';
}

/**
 * Retorna o label legível de um perfil de usuário.
 */
export function labelPerfil(perfil) {
  return PERFIL_USUARIO_LABELS[perfil] || perfil || '-';
}

/**
 * Formata uma data/hora no fuso horário do Brasil (America/Sao_Paulo).
 */
export function formatarDataHora(dataStr) {
  if (!dataStr) return '-';
  try {
    let str = String(dataStr);
    if (str.includes('T') && !str.includes('Z') && !str.includes('+') && !str.includes('-')) {
      str = str + 'Z';
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return new Date(dataStr).toLocaleString('pt-BR');
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return String(dataStr);
  }
}

/**
 * Formata apenas o horário (HH:mm) no fuso horário local.
 */
export function formatarHora(dataStr) {
  if (!dataStr) return '-';
  try {
    let str = String(dataStr);
    if (str.includes('T') && !str.includes('Z') && !str.includes('+') && !str.includes('-')) {
      str = str + 'Z';
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return new Date(dataStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(dataStr);
  }
}

// Lista de todos os status possíveis de pedido (para selects e botões)
export const LISTA_STATUS_PEDIDO = Object.entries(STATUS_PEDIDO_LABELS).map(
  ([value, label]) => ({ value, label })
);

// Ordem sequencial do fluxo de vida do pedido (Sem retrocesso)
export const ORDEM_FLUXO_STATUS = [
  'RECEBIDO',
  'EM_PREPARO',
  'PRONTO_PARA_ENTREGA',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE'
];

/**
 * Retorna as opções de status permitidas sem permitir retroceder o fluxo.
 */
export function obterOpcoesStatusProximos(statusAtual) {
  if (statusAtual === 'CANCELADO' || statusAtual === 'ENTREGUE') {
    return [];
  }

  const idxAtual = ORDEM_FLUXO_STATUS.indexOf(statusAtual);
  if (idxAtual === -1) {
    return LISTA_STATUS_PEDIDO;
  }

  // Apenas mantém o status atual ou avança para os próximos no fluxo
  const statusPermitidos = ORDEM_FLUXO_STATUS.slice(idxAtual);

  return LISTA_STATUS_PEDIDO.filter(opt =>
    statusPermitidos.includes(opt.value) || opt.value === 'CANCELADO'
  );
}

/**
 * Verifica se um pedido pode ter seu status alterado via seletor/botões.
 */
export function podeAlterarStatusPedido(pedido, perfil) {
  if (!pedido || !pedido.status) return false;
  if (pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO') return false;
  if (perfil === 'CLIENTE') return false;
  return perfil === 'ADMIN' || perfil === 'ENTREGADOR' || perfil === 'RESTAURANTE';
}

/**
 * Verifica se um pedido pode ser cancelado considerando o status atual e o perfil.
 */
export function podeCancelarPedido(pedido, perfil) {
  if (!pedido || !pedido.status) return false;
  if (pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO') return false;

  if (perfil === 'CLIENTE') {
    return pedido.status === 'RECEBIDO' || pedido.status === 'EM_PREPARO';
  }

  if (perfil === 'ENTREGADOR') {
    return pedido.status === 'SAIU_PARA_ENTREGA';
  }

  if (perfil === 'ADMIN' || perfil === 'RESTAURANTE') {
    return ['RECEBIDO', 'EM_PREPARO', 'PRONTO_PARA_ENTREGA', 'SAIU_PARA_ENTREGA'].includes(pedido.status);
  }

  return false;
}
