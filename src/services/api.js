const URL_BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:8100';

export async function requisitarApi(endpoint, opcoes = {}) {
  const token = localStorage.getItem('token');

  const cabecalhos = {
    'Content-Type': 'application/json',
    ...(opcoes.headers || {}),
  };

  if (token) {
    cabecalhos['Authorization'] = `Bearer ${token}`;
  }

  const resposta = await fetch(`${URL_BASE_API}${endpoint}`, {
    ...opcoes,
    headers: cabecalhos,
  });

  const tipoConteudo = resposta.headers.get('content-type');
  let dados = null;
  if (tipoConteudo && tipoConteudo.includes('application/json')) {
    dados = await resposta.json();
  }

  if (!resposta.ok) {
    if (resposta.status === 403 || resposta.status === 401) {
      if (token && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
    }

    let mensagemErro = dados?.mensagem || dados?.message;
    if (dados?.errosValidacao && typeof dados.errosValidacao === 'object') {
      const detalhesValidacao = Object.values(dados.errosValidacao).join('; ');
      if (detalhesValidacao) {
        mensagemErro = mensagemErro ? `${mensagemErro} (${detalhesValidacao})` : detalhesValidacao;
      }
    }
    if (!mensagemErro) {
      mensagemErro = dados?.erro || (typeof dados === 'string' ? dados : `Erro ${resposta.status}: Requisição inválida`);
    }

    throw new Error(mensagemErro);
  }

  return dados;
}

export const servicoAutenticacao = {
  entrar: async (email, senha) => {
    const dados = await requisitarApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email ? email.trim() : '', senha }),
    });
    if (dados && dados.token) {
      localStorage.setItem('token', dados.token);
      localStorage.setItem('user', JSON.stringify({
        nome: dados.email ? dados.email.split('@')[0] : 'Usuário',
        email: dados.email,
        perfil: dados.perfil
      }));
    }
    return dados;
  },

  cadastrar: async (nome, email, senha) => {
    const dados = await requisitarApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nome: nome ? nome.trim() : '',
        email: email ? email.trim() : '',
        senha,
        perfil: 'CLIENTE'
      }),
    });
    if (dados && dados.token) {
      localStorage.setItem('token', dados.token);
      localStorage.setItem('user', JSON.stringify({
        nome: nome || (dados.email ? dados.email.split('@')[0] : 'Usuário'),
        email: dados.email,
        perfil: dados.perfil
      }));
    }
    return dados;
  },

  sair: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  obterUsuarioAtual: () => {
    const usuarioStr = localStorage.getItem('user');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  },

  estaAutenticado: () => {
    return !!localStorage.getItem('token');
  },
};

export const servicoPedidos = {
  obterTodosPedidos: async () => {
    const resposta = await requisitarApi('/pedidos/listar-pedidos');
    if (Array.isArray(resposta)) {
      return resposta;
    }
    if (resposta && Array.isArray(resposta.content)) {
      return resposta.content;
    }
    return [];
  },

  obterTodosPedidosPaginado: async (pagina = 0, tamanho = 10, status = null) => {
    let url = `/pedidos/listar-pedidos?page=${pagina}&size=${tamanho}`;
    if (status && status !== 'ALL') {
      url += `&status=${status}`;
    }
    const resposta = await requisitarApi(url);
    if (resposta && Array.isArray(resposta.content)) {
      return resposta;
    }
    // Fallback caso backend retorne array direto
    const content = Array.isArray(resposta) ? resposta : [];
    return {
      content,
      totalElements: content.length,
      totalPages: Math.ceil(content.length / tamanho) || 1,
      number: pagina
    };
  },

  obterPedidoPorId: async (id) => {
    return await requisitarApi(`/pedidos/${id}`);
  },

  criarPedido: async (dadosPedido) => {
    return await requisitarApi('/pedidos', {
      method: 'POST',
      body: JSON.stringify(dadosPedido),
    });
  },

  atualizarStatusPedido: async (id, status) => {
    return await requisitarApi(`/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  atribuirEntregador: async (id, entregadorId) => {
    return await requisitarApi(`/pedidos/${id}/atribuir-entregador/${entregadorId}`, {
      method: 'PATCH',
    });
  },

  cancelarPedido: async (id, motivo, observacoes = '') => {
    return await requisitarApi(`/pedidos/${id}/cancelar`, {
      method: 'POST',
      body: JSON.stringify({ motivo, observacoes }),
    });
  },
};

export const servicoEntregadores = {
  obterTodosPaginado: async (pagina = 0, tamanho = 10) => {
    const resposta = await requisitarApi(`/entregadores?page=${pagina}&size=${tamanho}`);
    if (resposta && Array.isArray(resposta.content)) {
      return resposta;
    }
    const content = Array.isArray(resposta) ? resposta : [];
    return {
      content,
      totalElements: content.length,
      totalPages: Math.ceil(content.length / tamanho) || 1,
      number: pagina
    };
  },

  obterDisponiveis: async () => {
    const resposta = await requisitarApi('/entregadores/disponiveis');
    return Array.isArray(resposta) ? resposta : [];
  },

  obterPorId: async (id) => {
    return await requisitarApi(`/entregadores/${id}`);
  },

  cadastrar: async (dadosEntregador) => {
    return await requisitarApi('/entregadores', {
      method: 'POST',
      body: JSON.stringify(dadosEntregador),
    });
  },

  alternarDisponibilidade: async (id, disponivel) => {
    return await requisitarApi(`/entregadores/${id}/disponibilidade?disponivel=${disponivel}`, {
      method: 'PATCH',
    });
  },
};

export const servicoCancelamentos = {
  obterPaginado: async (pagina = 0, tamanho = 10, motivoFilter = null) => {
    const resposta = await requisitarApi(`/pedidos?status=CANCELADO&page=${pagina}&size=${tamanho}`);
    let content = [];
    let totalElements = 0;
    let totalPages = 1;

    if (resposta && Array.isArray(resposta.content)) {
      content = resposta.content;
      totalElements = resposta.totalElements || content.length;
      totalPages = resposta.totalPages || 1;
    } else if (Array.isArray(resposta)) {
      content = resposta;
      totalElements = content.length;
      totalPages = 1;
    }

    if (motivoFilter && motivoFilter !== 'ALL') {
      content = content.filter(p => p.cancelamento && p.cancelamento.motivo === motivoFilter);
    }

    return {
      content,
      totalElements,
      totalPages,
      number: pagina
    };
  },
};

// Serviço de Usuários
export const servicoUsuarios = {
  obterTodosPaginado: async (pagina = 0, tamanho = 10) => {
    const resposta = await requisitarApi(`/usuarios?page=${pagina}&size=${tamanho}`);
    if (resposta && Array.isArray(resposta.content)) {
      return resposta;
    }
    const content = Array.isArray(resposta) ? resposta : [];
    return {
      content,
      totalElements: content.length,
      totalPages: Math.ceil(content.length / tamanho) || 1,
      number: pagina,
    };
  },

  obterPorPerfilPaginado: async (perfil, pagina = 0, tamanho = 10) => {
    const url = perfil && perfil !== 'ALL'
      ? `/usuarios?perfil=${perfil}&page=${pagina}&size=${tamanho}`
      : `/usuarios?page=${pagina}&size=${tamanho}`;
    const resposta = await requisitarApi(url);
    if (resposta && Array.isArray(resposta.content)) {
      return resposta;
    }
    const content = Array.isArray(resposta) ? resposta : [];
    return {
      content,
      totalElements: content.length,
      totalPages: Math.ceil(content.length / tamanho) || 1,
      number: pagina,
    };
  },

  obterPorId: async (id) => {
    return await requisitarApi(`/usuarios/${id}`);
  },

  cadastrar: async (dadosUsuario) => {
    return await requisitarApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dadosUsuario),
    });
  },
};

// Gerenciamento de Itens Padrão de Cardápio

// ─── Serviço de Produtos (Cardápio Real - API) ───────────────────────────────
export const servicoProdutos = {
  obterTodosPaginado: async (pagina = 0, tamanho = 12, categoria = null) => {
    let url = `/produtos?page=${pagina}&size=${tamanho}&sort=nome,asc`;
    if (categoria && categoria !== 'ALL') {
      url += `&categoria=${encodeURIComponent(categoria)}`;
    }
    const resposta = await requisitarApi(url);
    if (resposta && Array.isArray(resposta.content)) {
      return resposta;
    }
    const content = Array.isArray(resposta) ? resposta : [];
    return {
      content,
      totalElements: content.length,
      totalPages: Math.ceil(content.length / tamanho) || 1,
      number: pagina,
    };
  },

  obterPorId: async (id) => {
    return await requisitarApi(`/produtos/${id}`);
  },

  cadastrar: async (dadosProduto) => {
    return await requisitarApi('/produtos', {
      method: 'POST',
      body: JSON.stringify(dadosProduto),
    });
  },

  atualizar: async (id, dadosProduto) => {
    return await requisitarApi(`/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dadosProduto),
    });
  },

  atualizarStatus: async (id, ativo) => {
    return await requisitarApi(`/produtos/${id}/status?ativo=${ativo}`, {
      method: 'PATCH',
    });
  },
};

// ─── Serviço de Clientes ─────────────────────────────────────────────────────
export const servicoClientes = {
  obterTodosPaginado: async (pagina = 0, tamanho = 12) => {
    const resposta = await requisitarApi(`/clientes?page=${pagina}&size=${tamanho}`);
    if (resposta && Array.isArray(resposta.content)) {
      return resposta;
    }
    const content = Array.isArray(resposta) ? resposta : [];
    return {
      content,
      totalElements: content.length,
      totalPages: Math.ceil(content.length / tamanho) || 1,
      number: pagina,
    };
  },

  obterPorId: async (id) => {
    return await requisitarApi(`/clientes/${id}`);
  },

  cadastrar: async (dadosCliente) => {
    return await requisitarApi('/clientes', {
      method: 'POST',
      body: JSON.stringify(dadosCliente),
    });
  },
};

const CHAVE_CARDAPIO_LOCAL = 'food_delivery_cardapio_itens';

const ITENS_CARDAPIO_SEED = [
  { id: '1', nome: 'X-Salada Especial', categoria: 'Lanches', precoUnitario: 28.90, descricao: 'Pão artesanal, hambúrguer 180g, queijo prato, alface, tomate e maionese da casa.' },
  { id: '2', nome: 'Pizza Margherita Grande', categoria: 'Pizzas', precoUnitario: 49.90, descricao: 'Molho de tomate italiano, muçarela de búfala, manjericão fresco e azeite extravirgem.' },
  { id: '3', nome: 'Batata Frita Rústica', categoria: 'Acompanhamentos', precoUnitario: 18.50, descricao: 'Porção de 300g com molho cheddar e bacon crocante.' },
  { id: '4', nome: 'Refrigerante Lata 350ml', categoria: 'Bebidas', precoUnitario: 7.00, descricao: 'Coca-Cola, Guaraná Antarctica ou Sprite bem gelado.' },
  { id: '5', nome: 'Combo Burger + Fritas + Bebida', categoria: 'Combos', precoUnitario: 45.00, descricao: 'Hambúrguer duplo cheddar, batata média e refrigerante à sua escolha.' },
  { id: '6', nome: 'Petit Gâteau de Chocolate', categoria: 'Sobremesas', precoUnitario: 22.00, descricao: 'Bolo quente de chocolate belga acompanhado de sorvete de creme.' }
];

export const servicoCardapio = {
  obterItens: () => {
    const salvo = localStorage.getItem(CHAVE_CARDAPIO_LOCAL);
    if (!salvo) {
      localStorage.setItem(CHAVE_CARDAPIO_LOCAL, JSON.stringify(ITENS_CARDAPIO_SEED));
      return ITENS_CARDAPIO_SEED;
    }
    try {
      return JSON.parse(salvo);
    } catch {
      return ITENS_CARDAPIO_SEED;
    }
  },

  salvarItem: (item) => {
    const atuais = servicoCardapio.obterItens();
    let novos;
    if (item.id) {
      novos = atuais.map(i => i.id === item.id ? item : i);
    } else {
      const novoItem = { ...item, id: Date.now().toString() };
      novos = [novoItem, ...atuais];
    }
    localStorage.setItem(CHAVE_CARDAPIO_LOCAL, JSON.stringify(novos));
    return novos;
  },

  removerItem: (id) => {
    const atuais = servicoCardapio.obterItens();
    const novos = atuais.filter(i => i.id !== id);
    localStorage.setItem(CHAVE_CARDAPIO_LOCAL, JSON.stringify(novos));
    return novos;
  }
};

// Aliases para compatibilidade
export const authService = servicoAutenticacao;
export const orderService = servicoPedidos;
export const apiFetch = requisitarApi;

