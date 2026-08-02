/**
 * Utilitário centralizado para mapear enums da API para textos legíveis na UI.
 * Evita exibir strings de enum brutas para o usuário final.
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
 * Se não encontrar, retorna o próprio valor como fallback.
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

// Lista de todos os status possíveis de pedido (para selects e botões)
export const LISTA_STATUS_PEDIDO = Object.entries(STATUS_PEDIDO_LABELS).map(
  ([value, label]) => ({ value, label })
);
