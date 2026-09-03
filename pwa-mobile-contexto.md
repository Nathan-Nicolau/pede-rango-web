# 📱 Contexto de Implementação: PWA & Mobile-First — Pede Rango WEB

Este documento registra todas as alterações de arquitetura, identidade visual, responsividade mobile e suporte a **Progressive Web App (PWA)** implementadas no projeto **Pede Rango WEB** (`pede-rango-web`).

---

## 🎯 1. Decisão de Arquitetura (Por que PWA & Mobile-First?)

Em vez de criar uma aplicação separada em React Native (que exigiria outro pipeline de build e rodaria fora do cluster Kubernetes), optou-se pela estratégia **Mobile-First / PWA**:
- **Base de Código Única**: O mesmo frontend React + Vite + Nginx atende Desktop e Smartphones.
- **Experiência Nativa sem Lojas de Apps**: Permite instalação na tela inicial (*Add to Home Screen*) no iOS (Safari) e Android (Chrome), abrindo em modo tela cheia (*standalone*) sem a barra de endereços do navegador.
- **Integração Total com Kubernetes**: Deploy mantido via Helm e Ingress NGINX no cluster local Kind.

---

## 🔥 2. Nova Identidade Visual (Pede Rango)

- **Nome da Marca**: `Pede Rango` com slogan *"Sabor & Entrega Rápida"*.
- **Novo Ícone de Marca**: Substituição do ícone de talheres genérico pelo ícone **`Flame` (Chama Estilizada)** em gradiente carmesim (`#FF2E2E` a `#900000`) com acentos dourados (`#FFD700`), transmitindo calor, dinamismo e apetite.
- **Novo Favicon Vetorial**: Criado em `public/favicon.svg` com alta definição e suporte a temas.
- **Renomeação de Projetos**:
  - `food-delivery-api` ➡️ `pede-rango-api`
  - `food-delivery-web` ➡️ `pede-rango-web`

---

## 📲 3. Estrutura do Progressive Web App (PWA)

### 📄 `public/manifest.json`
Define os metadados para instalação nos smartphones:
```json
{
  "short_name": "Pede Rango",
  "name": "Pede Rango — Sabor & Delivery",
  "description": "Aplicativo de Delivery e Gestão de Pedidos Pede Rango",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#121214",
  "theme_color": "#D30101",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "64x64 128x128 192x192 512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

### ⚙️ `public/sw.js` (Service Worker)
- Estratégia de **Cache App Shell**: Pré-cacheia arquivos essenciais (`/`, `index.html`, `favicon.svg`, `manifest.json`).
- Estratégia **Network-First**: Garante que requisições de API (`/actuator/`, endpoints de pedidos) sempre consultem a rede em tempo real.
- Registro automático em `src/main.jsx`.

### 🌐 `index.html` (Meta Tags Mobile & iOS)
- `viewport-fit=cover` para adaptação aos cantos arredondados e notches de celulares modernos.
- `apple-mobile-web-app-capable` e `apple-mobile-web-app-status-bar-style: black-translucent`.

---

## 🧭 4. Navegação Mobile: Bottom Navigation Bar (`BottomNav.jsx`)

Para telas menores que `768px`, as abas superiores do topo são ocultadas (`.desktop-nav-tabs { display: none }`) e substituídas por uma **Barra de Navegação Inferior Fixa**:

```
┌────────────────────────────────────────────────────────┐
│ [LOGO] Pede Rango               (🌓 Tema) [👤 Perfil]  │  <-- Header Compacto
├────────────────────────────────────────────────────────┤
│                                                        │
│                  Conteúdo da Aplicação                 │
│                                                        │
├────────────────────────────────────────────────────────┤
│   📦         🍔          ➕          📜         👤    │  <-- BottomNav com FAB
│ Pedidos   Cardápio   Novo Pedido  Histórico   Perfil   │
└────────────────────────────────────────────────────────┘
```

### Comportamento Dinâmico por Perfil:
1. **CLIENTE**:
   - `📦 Pedidos`: Acompanhamento de pedidos ativos.
   - `🍔 Cardápio`: Navegação e escolha de produtos.
   - `➕ Botão FAB Central`: Botão flutuante em gradiente com destaque para solicitar novo pedido rapidamente.
   - `📜 Histórico`: Histórico completo de pedidos anteriores.
   - `👤 Perfil`: Acesso e edição de endereço padrão e telefone.
2. **ADMINISTRADOR**:
   - `📦 Pedidos`, `🚚 Entregadores`, `➕ Novo Pedido (FAB)`, `🍔 Cardápio` e `⚡ Mais` (abre *Bottom Sheet* com Cancelados, Usuários, Clientes e Perfil).
3. **ENTREGADOR**:
   - `🚚 Entregas`, `🍔 Cardápio`, `👤 Perfil`.

---

---

## 📐 5. Ajustes de CSS, UI e Responsividade Mobile (`src/index.css`)

- **Top Bar / Header Compacto no Mobile**:
  - Removido o botão redundante *"Novo Pedido"* do topo no mobile (já atendido com destaque pelo FAB central na `BottomNav`).
  - Ocultados textos auxiliares e simplificado o botão de tema e avatar do usuário no cabeçalho para eliminar qualquer rolagem horizontal em celulares menores.
- **Cards de Status e Contagem em Grid Compacto (`OrderStats.jsx`)**:
  - Em telas menores que `768px`, os 5 cards de resumo não empilham mais verticalmente em telas cheias; são dispostos em um **Grid 2x2 com Banner de Total** (`order-stats-grid`).
  - Dimensões, padding (`10px 12px`), tipografia (`1.25rem`) e ícones reduzidos para economizar altura de rolagem e exibir a lista de pedidos imediatamente.
- **Aba e Formulário de Cadastro de Cliente (`AuthModal.jsx` e `ClientesView.jsx`)**:
  - Grids de duas colunas (CPF/Telefone e E-mail/Senha) convertidos em coluna única responsiva (`auth-form-grid-2col`) no mobile, garantindo visualização sem cortes laterais e digitação confortável.
  - Abas de alternância *"Entrar"* e *"Cadastrar Cliente"* ajustadas para não quebrar linha (`white-space: nowrap`) em telas estreitas.
- **Modais Adaptativos com Rodapé Fixo/Sticky (`CreateOrderModal.jsx` e `OrderDetailModal.jsx`)**:
  - Modal em flexbox estruturado (`create-order-modal-dialog`): cabeçalho e stepper com `flex-shrink: 0`, conteúdo com rolagem vertical independente (`overflow-y: auto`) e rodapé fixo (`create-order-modal-footer`).
  - **Conversão de Tabelas Rígidas em Cards no Mobile (`.desktop-items-table` vs `.mobile-items-list`)**: Em telas menores que `768px`, as tabelas de 4 colunas de itens de pedido (que estouram na lateral) são substituídas por cards fluidos individuais (`Nome`, `Qtd x Unitário` e `Subtotal`), garantindo **zero overflow lateral** e legibilidade total.
  - **Empilhamento Vertical dos Botões de Rodapé**: Os botões de ação ("Confirmar e Enviar Pedido", "Voltar aos Itens", "Avançar para Endereço") passam a ocupar `100%` da largura de forma vertical, facilitando o toque com o polegar e eliminando quebra de texto em duas linhas.
- **Campos de Busca com Ícone Embutido (`.search-input-with-icon`)**:
  - Correção de sobreposição de ícone de lupa sobre o texto em todas as telas (`CreateOrderModal`, `EntregadoresView`, `ClientesView`, `CardapioView`, etc.) com `padding-left: 42px !important`.
- **Alinhamento Vertical de Componentes que Quebram na Horizontal**:
  - Cards de entregadores em rota (`ActiveDeliveryRidersCard`), sub-abas de logística (`EntregadorOrdersView`), cabeçalhos e barras de busca convertidos para alinhamento vertical (`flex-direction: column`) quando o espaço horizontal é restrito, mantendo botões e badges 100% contidos na tela.
- **Paginação Minimalista por Ícones de Setas (`PaginationControls.jsx`)**:
  - Textos "Anterior" e "Próxima" substituídos por ícones direcionais elegantes (`<ChevronLeft size={18} />` e `<ChevronRight size={18} />`), economizando largura horizontal e centralizando a indicação de página `Página X de Y` em todas as telas e perfis.
- **Modais Responsivos de Cadastro de Usuários e Entregadores (`UsuariosView.jsx` e `CreateEntregadorModal.jsx`)**:
  - Formulários de cadastro que possuíam colunas duplas rígidas (Email/Perfil e Veículo/Placa) convertidos para coluna única responsiva (`auth-form-grid-2col`), garantindo que campos de seleção e inputs não fiquem espremidos ou cortados.
  - Botões de ação dos modais agora empilham verticalmente com largura total (`modal-footer-actions`).
- **Otimização de Categorias e Fontes na Criação de Pedidos (`CreateOrderModal.jsx`)**:
  - Barra de categorias com pílulas horizontais fluidas (`.create-order-categories` / `.category-pill-btn`) com rolagem suave (`-webkit-overflow-scrolling: touch`) e sem barra de rolagem visual poluindo a tela.
  - Leve redução proporcional nas fontes dos cards de produtos (`0.94rem` para título, `0.74rem` para descrição, `1rem` para preço) e padding refinado para encaixe perfeito na visualização mobile.
- **Touch Targets & Safe Area Insets**:
  - Inputs com `1rem` de tamanho de fonte (evitando auto-zoom em navegadores mobile).
  - Suporte a `env(safe-area-inset-bottom)` garantindo espaçamento ideal em aparelhos com barra de navegação virtual (iPhones modernos e Androids com gestos).

---

## 🌐 6. Configuração de Rede, DNS e Ingress

- **Hosts Locais (`/etc/hosts`)**:
  - `127.0.0.1 app.pede-rango.local`
  - `127.0.0.1 api.pede-rango.local`
- **Acesso Mobile via Rede Local (nip.io)**:
  - Frontend: `http://app.<IP_LOCAL>.nip.io` (ex: `http://app.192.168.3.27.nip.io`)
  - Backend API: `http://api.<IP_LOCAL>.nip.io` (ex: `http://api.192.168.3.27.nip.io`)
- **CORS Backend (`SecurityConfig.java`)**:
  - Habilitado suporte explícito aos padrões `http://*.nip.io` e faixas `http://192.168.*.*` para garantir funcionamento sem erro de `Failed to fetch` ao acessar de dispositivos na rede local.

---

## 🚀 7. Como Testar e Fazer Deploy

```bash
# Frontend:
cd ~/Documentos/Projetos/pede-rango-web
./deploy-local.sh

# Backend API e Banco:
cd ~/Documentos/Projetos/pede-rango-api
./deploy-local.sh

# Acessar a aplicação no navegador Desktop ou Mobile:
# Desktop: http://app.pede-rango.local
# Celular (mesma rede Wi-Fi): http://app.192.168.3.27.nip.io
```

---

## 🏗️ 8. Estrutura e Nomenclatura Padronizada (`pede_rango`)

Todos os nomes de arquivos, pods, services, secrets, PVCs e bancos de dados foram 100% padronizados para o padrão `pede_rango` / `pede-rango`, eliminando resquícios do nome legado:

| Recurso | Nome Atual Padronizado | Descrição |
| :--- | :--- | :--- |
| **Banco Docker Local** | `pede_rango_db` (Porta 5433) | Container Postgres com database `pede_rango_db`, user `pede_rango_user` |
| **StatefulSet K8s** | `pede-rango-db` (Pod `pede-rango-db-0`) | Postgres interno no cluster com volume persistente `pede-rango-db-pvc` |
| **Service DB** | `pede-rango-db` (Porta 5432) | DNS interno `jdbc:postgresql://pede-rango-db:5432/pede_rango_db` |
| **Secret K8s** | `pede-rango-secrets` | Armazena credenciais `db-name`, `db-user`, `db-password` |
| **API Deployment** | `pede-rango-api` (Pod `pede-rango-api-*`) | Deployment Spring Boot com imagem `pede-rango-api:v1` |
| **API Service / Ingress** | `pede-rango-api-service` / `pede-rango-api-ingress` | Roteamento para `api.pede-rango.local` e `api.192.168.3.27.nip.io` |
| **API HPA** | `pede-rango-api-hpa` | Auto-scaling horizontal de 1 a 3 réplicas |
| **Web Deployment** | `pede-rango-web` (Pod `pede-rango-web-*`) | Deployment React PWA Nginx com imagem `pede-rango-web:v3` |
| **Web Service / Ingress** | `pede-rango-web-service` / `pede-rango-web-ingress` | Roteamento para `app.pede-rango.local` e `app.192.168.3.27.nip.io` |
| **Helm Releases** | `pede-rango-api` e `pede-rango-web` | Gerenciamento e deploy dos charts no cluster Kind |
