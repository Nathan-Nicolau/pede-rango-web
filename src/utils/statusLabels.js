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

// FormaPagamento → Label legível
export const FORMA_PAGAMENTO_LABELS = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
};

/**
 * Retorna o label legível de uma forma de pagamento.
 */
export function labelFormaPagamento(forma) {
  return FORMA_PAGAMENTO_LABELS[forma] || forma || 'Dinheiro';
}

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
 * Formata uma data/hora recebida da API (LocalDateTime sem offset = hora local do Brasil).
 * NÃO adiciona 'Z' pois a string já está no horário de Brasília.
 */
export function formatarDataHora(dataStr) {
  if (!dataStr) return '-';
  try {
    const str = String(dataStr);
    // LocalDateTime da API: "2026-08-03T00:03:15" — sem Z, sem offset.
    // Extraímos as partes diretamente para evitar conversão de timezone.
    const semOffset = str.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
    const partes = semOffset.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (partes) {
      const [, ano, mes, dia, hora, min, seg] = partes;
      return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
    }
    // Fallback: tenta parse normal (sem conversão de tz)
    const d = new Date(str.includes('T') ? str : str.replace(' ', 'T'));
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'America/Sao_Paulo'
      });
    }
    return str;
  } catch {
    return String(dataStr);
  }
}

/**
 * Formata apenas o horário (HH:mm) de um LocalDateTime da API (sem conversão de timezone).
 */
export function formatarHora(dataStr) {
  if (!dataStr) return '-';
  try {
    const str = String(dataStr);
    const semOffset = str.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');
    const partes = semOffset.match(/^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/);
    if (partes) {
      return `${partes[1]}:${partes[2]}`;
    }
    return str;
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
 * Retorna as opções de status permitidas sem permitir retroceder o fluxo e respeitando o perfil operacional.
 */
export function obterOpcoesStatusProximos(statusAtual, perfil = 'ADMIN') {
  if (!statusAtual || statusAtual === 'CANCELADO' || statusAtual === 'ENTREGUE') {
    return [];
  }

  // Regra para RESTAURANTE: controla o ciclo de cozinha até PRONTO_PARA_ENTREGA
  if (perfil === 'RESTAURANTE') {
    if (statusAtual === 'RECEBIDO') {
      return [
        { value: 'RECEBIDO', label: 'Recebido' },
        { value: 'EM_PREPARO', label: 'Em Preparo' },
        { value: 'PRONTO_PARA_ENTREGA', label: 'Pronto para Entrega' }
      ];
    }
    if (statusAtual === 'EM_PREPARO') {
      return [
        { value: 'EM_PREPARO', label: 'Em Preparo' },
        { value: 'PRONTO_PARA_ENTREGA', label: 'Pronto para Entrega' }
      ];
    }
    // Quando PRONTO_PARA_ENTREGA ou além, o restaurante não avança mais (cabe ao entregador)
    return [];
  }

  // Regra para ENTREGADOR: controla o ciclo de transporte/entrega
  if (perfil === 'ENTREGADOR') {
    if (statusAtual === 'PRONTO_PARA_ENTREGA') {
      return [
        { value: 'PRONTO_PARA_ENTREGA', label: 'Pronto para Entrega' },
        { value: 'SAIU_PARA_ENTREGA', label: 'Saiu para Entrega' }
      ];
    }
    if (statusAtual === 'SAIU_PARA_ENTREGA') {
      return [
        { value: 'SAIU_PARA_ENTREGA', label: 'Saiu para Entrega' },
        { value: 'ENTREGUE', label: 'Entregue' }
      ];
    }
    return [];
  }

  // Regra para ADMIN: supervisão completa sequencial
  if (perfil === 'ADMIN') {
    const idxAtual = ORDEM_FLUXO_STATUS.indexOf(statusAtual);
    if (idxAtual === -1) return LISTA_STATUS_PEDIDO;
    const statusPermitidos = ORDEM_FLUXO_STATUS.slice(idxAtual);
    return LISTA_STATUS_PEDIDO.filter(opt =>
      statusPermitidos.includes(opt.value) && opt.value !== 'CANCELADO'
    );
  }

  return [];
}

/**
 * Verifica se um pedido pode ter seu status alterado via seletor/botões.
 */
export function podeAlterarStatusPedido(pedido, perfil) {
  if (!pedido || !pedido.status) return false;
  if (pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO') return false;
  if (perfil === 'CLIENTE') return false;

  if (perfil === 'RESTAURANTE') {
    return pedido.status === 'RECEBIDO' || pedido.status === 'EM_PREPARO';
  }

  if (perfil === 'ENTREGADOR') {
    return pedido.status === 'PRONTO_PARA_ENTREGA' || pedido.status === 'SAIU_PARA_ENTREGA';
  }

  return perfil === 'ADMIN';
}

/**
 * Verifica se um pedido pode ser cancelado diretamente na UI considerando o status e perfil.
 */
export function podeCancelarPedido(pedido, perfil) {
  if (!pedido || !pedido.status) return false;
  if (pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO') return false;

  // Cliente: cancelamento direto permitido apenas enquanto RECEBIDO (antes de iniciar o preparo)
  if (perfil === 'CLIENTE') {
    return pedido.status === 'RECEBIDO';
  }

  // Entregador: reporta problema de entrega apenas em rota
  if (perfil === 'ENTREGADOR') {
    return pedido.status === 'SAIU_PARA_ENTREGA';
  }

  // Restaurante e Admin: podem cancelar qualquer pedido não finalizado (por solicitação via WhatsApp, falta de item, etc.)
  if (perfil === 'ADMIN' || perfil === 'RESTAURANTE') {
    return ['RECEBIDO', 'EM_PREPARO', 'PRONTO_PARA_ENTREGA', 'SAIU_PARA_ENTREGA'].includes(pedido.status);
  }

  return false;
}
