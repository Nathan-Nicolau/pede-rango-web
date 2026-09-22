# 📱 Contexto de Arquitetura, Perfis de Usuário & PWA Mobile — Pede Rango

Este documento é a **fonte única da verdade** da arquitetura, perfis de acesso, regras de negócio e responsividade mobile do ecossistema **Pede Rango**.

---

## 🏛️ 1. Separação de Perfis & Telas da Aplicação (RBAC)

A arquitetura de telas do **Pede Rango** é rigidamente segmentada por perfil para garantir que cada usuário veja apenas o que é relevante para a sua função:

```
                      ┌────────────────────────────────────────┐
                      │              PEDE RANGO                │
                      └───────────────────┬────────────────────┘
                                          │
        ┌───────────────────┬─────────────┴───────┬───────────────────┐
        ▼                   ▼                     ▼                   ▼
┌───────────────┐   ┌───────────────┐     ┌───────────────┐   ┌───────────────┐
│     ADMIN     │   │  RESTAURANTE  │     │  ENTREGADOR   │   │    CLIENTE    │
│  (Gestão/BI)  │   │  (Operação)   │     │  (Logística)  │   │ (PWA Consumo) │
└───────────────┘   └───────────────┘     └───────────────┘   └───────────────┘
```

---

### 👑 1.1. Perfil `ADMIN` (Gestão Executiva, BI & Procedimentos Administrativos)
- **Papel**: Proprietário, Diretor ou Administrador da Rede. Não opera a cozinha no minuto a minuto.
- **Interface Exclusiva**: **Dashboard Executivo & Central Administrativa**.
- **Funcionalidades Principais**:
  - **Cards de BI em Tempo Real**:
    - Faturamento Total (R$) e Faturamento Líquido.
    - Ticket Médio por Pedido.
    - Quantidade Total de Pedidos (Entregues vs Cancelados).
    - Eficiência da Frota de Entregadores (Tempo médio de entrega).
  - **Filtros Temporais Avançados**:
    - 📅 **Hoje / Ontem** (Visão do dia)
    - 📅 **Semana** (Últimos 7 dias)
    - 📅 **Quinzena** (Últimos 15 dias)
    - 📅 **Mês Atual / Últimos 30 Dias**
    - 📅 **Intervalo Personalizado (Data Início -> Data Fim)**
  - **Gráficos e Indicadores**:
    - Curva de Faturamento por Hora / por Dia.
    - Top 5 Produtos Mais Vendidos.
    - Distribuição por Forma de Pagamento (PIX vs Dinheiro vs Cartões).
    - Análise de Cancelamentos e Motivos mais frequentes.
  - **Gestão Global de Usuários**:
    - Cadastro, ativação/inativação de contas de Administradores, Restaurantes, Entregadores e Clientes.

---

### 🍳 1.2. Perfil `RESTAURANTE` (Operação de Cozinha, Balcão & Despacho)
- **Papel**: Gerente da loja, cozinheiros e atendentes de balcão. Foco na preparação e saída rápida de comida.
- **Interface**: **Painel Kanban / Fila Operacional de Pedidos**.
- **Funcionalidades Principais**:
  - **Fila de Pedidos em Tempo Real**:
    - Recepção de novos pedidos (`RECEBIDO`) com aviso sonoro (*beep de cozinha*).
    - Avanço rápido de status: `RECEBIDO` ➔ `EM_PREPARO` ➔ `PRONTO_PARA_ENTREGA`.
  - **Visualização Clara da Comanda**:
    - Exibição destacada das **Observações dos Itens** (ex: *"Sem cebola"*, *"Ponto da carne bem passado"*).
    - Exibição destacada da **Forma de Pagamento e Troco**.
  - **Gestão do Cardápio Operacional**:
    - Pausar/despausar itens em falta no estoque.
    - Edição rápida de preços e categorias.
  - **Atribuição de Entregas**:
    - Visualização de entregadores online para despacho de pedidos prontos.

---

### 🛵 1.3. Perfil `ENTREGADOR` (Logística & Trânsito)
- **Papel**: Motoboys e entregadores parceiros.
- **Interface**: **App Mobile de Entregas**.
- **Funcionalidades**:
  - Controle de disponibilidade (🟢 Disponível / 🔴 Ocupado / Offline).
  - Fila de pedidos aguardando entrega (`PRONTO_PARA_ENTREGA`).
  - Aceite de corrida e avanço para `SAIU_PARA_ENTREGA` ➔ `ENTREGUE`.
  - Exibição de rota/endereço com atalho para GPS e **botão de WhatsApp** com mensagem pré-formatada para o cliente.
  - Alerta de cobrança: se pagamento for `DINHEIRO`, avisa *"Levar R$ X de troco"*; se `CARTÃO`, avisa *"Levar maquininha"*.

---

### 🛍️ 1.4. Perfil `CLIENTE` (PWA Mobile-First)
- **Papel**: Consumidor final.
- **Interface**: **Cardápio Digital & Checkout Simplificado**.
- **Funcionalidades**:
  - Navegação fluida por categorias com pílulas horizontais.
  - Sacola com adição de observações personalizadas por item.
  - Checkout com escolha da forma de pagamento (`DINHEIRO` com cálculo de troco, `PIX`, `CARTÃO DE CRÉDITO`, `CARTÃO DE DÉBITO`).
  - Acompanhamento do status do pedido em tempo real (`Recebido` ➔ `Em Preparo` ➔ `Saiu para Entrega` ➔ `Entregue`).

---

## 💳 2. Formas de Pagamento e Troco (Implementado)

A aplicação não utiliza intermediadores/gateways de pagamento online, operando de forma direta:
1. 💵 **Dinheiro**:
   - Checkbox *"Precisa de troco?"*.
   - Input *"Troco para quanto?"* com cálculo dinâmico: `Troco a devolver = Troco Para - Total`.
   - Validação no frontend e backend: `trocoPara >= valorTotal`.
2. 📱 **PIX na Entrega**:
   - Informa que o pagamento será feito via chave PIX na entrega.
3. 💳 **Cartão de Crédito (Maquininha)**:
   - Alerta o entregador para levar a maquininha no Crédito.
4. 💳 **Cartão de Débito (Maquininha)**:
   - Alerta o entregador para levar a maquininha no Débito.

---

## 🌐 3. Resolução Dinâmica de Host (Correção de `Failed to fetch` no Mobile)

Para eliminar o erro de `Failed to fetch` quando o aplicativo é acessado pelo celular ou outros dispositivos na rede Wi-Fi local:
- O módulo `src/services/api.js` calcula a URL base da API dinamicamente:
  - Se acessado via `app.192.168.3.27.nip.io` ➔ API aponta para `http://api.192.168.3.27.nip.io`.
  - Se acessado via `app.pede-rango.local` ➔ API aponta para `http://api.pede-rango.local`.
  - Se acessado via IP direto `http://192.168.3.27:5173` ➔ API aponta para `http://api.192.168.3.27.nip.io`.
  - Se acessado no Desktop `localhost:5173` ➔ API aponta para `http://localhost:8100`.

---

## 🚀 4. Comandos de Deploy Local (Kind + Kubernetes)

```bash
# Deploy Backend API (Spring Boot):
cd ~/Documentos/Projetos/pede-rango-api
./deploy-local.sh

# Deploy Frontend Web PWA (React):
cd ~/Documentos/Projetos/pede-rango-web
./deploy-local.sh

# Endpoints:
# Desktop: http://app.pede-rango.local
# Mobile (Wi-Fi): http://app.192.168.3.27.nip.io
# Swagger API: http://api.192.168.3.27.nip.io/swagger-ui.html
```
