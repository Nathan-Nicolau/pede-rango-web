# 🍔 Pede Rango WEB — Frontend PWA & Painel Administrativo

Interface moderna, reativa e progressiva (PWA) construída com **React 18**, **Vite** e **Tailwind CSS**, oferecendo uma experiência completa tanto para clientes finais quanto para operadores de restaurante, administradores e entregadores.

---

## 📌 Funcionalidades Principais

### 🛍️ 1. Experiência do Cliente (Cardápio & Pedidos)
- **Cardápio Interativo**: Navegação por categorias (Lanches, Pizzas, Bebidas, Sobremesas, Combos, etc.) com busca em tempo real.
- **Sacola de Compras com Observações**: Personalização de itens (ex: *"Sem cebola"*, *"Ponto da carne bem passado"*).
- **Checkout Guiado & ViaCEP**: Preenchimento automático de endereço via CEP com cálculo transparente de taxa de entrega e tempo estimado.
- **Múltiplas Formas de Pagamento**:
  - `DINHEIRO` (com cálculo e conferência de troco);
  - `PIX` (com visualização e cópia da chave cadastrada);
  - `CARTAO_CREDITO` e `CARTAO_DEBITO` (para pagamento na maquininha na entrega).
- **Linha do Tempo Visual (Stepper de 5 Etapas)**: Acompanhamento em tempo real do status do pedido (`RECEBIDO` ➔ `EM_PREPARO` ➔ `PRONTO_PARA_ENTREGA` ➔ `SAIU_PARA_ENTREGA` ➔ `ENTREGUE`).
- **Repetir Pedido em 1 Clique (Reorder)**: Reenvio ágil de pedidos favoritos anteriores diretamente pelo card ou modal de detalhes.
- **Cancelamento com Auditoria**: Opção de cancelamento pelo cliente antes do despacho, com registro de motivo.

---

### 🍳 2. Painel Operacional do Restaurante & Frente de Caixa
- **Controle de Turno & Expediente Diário**:
  - **Iniciar Dia de Trabalho**: Modal para confirmar/ajustar a taxa de entrega e tempo estimado do dia.
  - **Pausar / Retomar Recebimento**: Controle instantâneo para pausar a entrada de novos pedidos em horários de pico e retomar sem reiniciar o dia.
  - **Encerrar Expediente**: Fechamento do turno com reset diário automático à meia-noite (`00:00`).
- **Gestão de Pedidos em Tempo Real**: Filtros por status, cards responsivos e transição de estados de produção.
- **Impressão de Comanda de Cozinha**: Formatação otimizada para impressoras térmicas (bobinas de 80mm) ou folha padrão com dados completos do pedido, itens e observações.
- **Gestão do Cardápio**: Cadastro, edição, alteração de preços e inativação de produtos.

---

### 🚚 3. Fila de Entregas & Entregadores
- **Visão Dedicada do Entregador**: Fila de pedidos prontos para entrega (`PRONTO_PARA_ENTREGA`).
- **Atribuição Rápida**: Aceite de entrega vinculando o entregador ao pedido e alterando para `SAIU_PARA_ENTREGA`.
- **Contato Rápido via WhatsApp**: Botão com link direto para iniciar conversa com o cliente já com dados do pedido.
- **Confirmação de Entrega**: Finalização do pedido com 1 clique.

---

### 📊 4. Dashboard Executivo de BI & Gestão (Admin)
- **Métricas Consolidadas**: Faturamento total, volume de pedidos, ticket médio e taxa de cancelamento.
- **Filtros por Período**: Visualização por `Hoje`, `Esta Semana`, `Quinzena` ou `Este Mês`.
- **Exportação de Relatórios em CSV**: Download de arquivo analítico com codificação UTF-8 BOM compatível nativamente com Excel.
- **Gestão de Usuários**: Visualização, contagem e criação de usuários com controle de perfil (`ADMIN`, `RESTAURANTE`, `ENTREGADOR`, `CLIENTE`).
- **Configurações Gerais**: Ajuste de telefone de contato, chave PIX e parâmetros de taxa.

---

## 🛠️ Stack Tecnológica

| Componente | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Framework Base** | React 18 | Biblioteca UI reativa com hooks e context API |
| **Build Tool** | Vite 5 | Bundler de altíssima velocidade e Hot Module Replacement (HMR) |
| **Estilização** | Tailwind CSS 3 | Framework de CSS utilitário responsivo |
| **Ícones** | Lucide React | Conjunto de ícones leves e consistentes |
| **HTTP Client** | Axios | Cliente HTTP para consumo da REST API com interceptors JWT |
| **Servidor de Produção** | NGINX Alpine | Servidor web leve e de alta performance |

---

## 📁 Estrutura de Diretórios

```
pede-rango-web/
├── public/                     # Assets estáticos
├── src/
│   ├── components/             # Componentes modulares e reutilizáveis
│   │   ├── AuthModal.jsx       # Modal de Login e Auto-cadastro com formulários isolados
│   │   ├── CardapioView.jsx    # Visualização e gestão do cardápio
│   │   ├── CreateOrderModal.jsx# Wizard de criação de pedido com ViaCEP e pagamento
│   │   ├── DashboardBI.jsx     # Painel de BI, gráficos e exportação de CSV
│   │   ├── DeliveryAssignmentModal.jsx # Atribuição de entregador
│   │   ├── Header.jsx          # Barra superior com status da loja e ações
│   │   ├── OrderCard.jsx       # Card de pedido com ações rápidas e reorder
│   │   ├── OrderDetailModal.jsx# Modal de detalhes com stepper de 5 etapas e impressão
│   │   ├── StoreConfigModal.jsx# Modal de configurações gerais do estabelecimento
│   │   ├── UsersModal.jsx      # Modal de gestão de usuários (Admin)
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx     # Gerenciamento de sessão, token JWT e perfil RBAC
│   ├── services/
│   │   └── api.js              # Instância Axios e métodos de integração com o backend
│   ├── utils/
│   │   ├── formatters.js       # Formatadores de moeda (BRL), data, telefone e CPF
│   │   ├── imprimirComanda.js  # Utilitário de formatação de comanda térmica para impressão
│   │   └── sanitizers.js       # Sanitização e máscaras numéricas estritas
│   ├── App.jsx                 # Componente raiz da aplicação
│   └── main.jsx                # Ponto de entrada React
├── Dockerfile                  # Build multi-stage com Node e NGINX
├── nginx.conf                  # Configuração de SPA routing no NGINX
└── package.json                # Dependências e scripts
```

---

## 🚀 Como Executar

### 1. Desenvolvimento Local (Vite)
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (porta 5173 ou configurada)
npm run dev
```

### 2. Execução via Docker
```bash
# Build da imagem
docker build -t pede-rango-web:v3 .

# Execução em contêiner
docker run -d -p 80:80 --name pede-rango-web pede-rango-web:v3
```

### 3. Deploy no Kubernetes (Kind + Helm)
```bash
# Executar script automatizado de build e deploy
./deploy-local.sh
```

---

## 🔒 Segurança & Boas Práticas
- **Isolamento de Credenciais**: Formulários de login e cadastro mantêm estados independentes para evitar conflitos de preenchimento automático.
- **Sanitização Estrita**: Inputs numéricos (CPF, CEP, telefone, valores de taxa e preços) passam por tratamento e limpeza em tempo real.
- **Armazenamento Seguro de Sessão**: Tokens JWT persistidos em `localStorage` com controle de expiração e limpeza automática ao deslogar.

