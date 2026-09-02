# LabStock - Sistema de Controle de Estoque para Laboratório

Sistema web completo de controle e gestão de estoque para laboratórios de engenharia, eletrônica, prototipagem, química e manutenção.

Desenvolvido com **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**, **Recharts** e **Lucide React**.

---

## 🚀 Como Executar o Projeto

Certifique-se de ter o **Node.js** (v18+) instalado na máquina.

```bash
# 1. Acesse o diretório do projeto
cd lab-stock-manager

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## 🔬 Funcionalidades Principais

### 1. Dashboard Executivo & Operacional
- **KPIs em Tempo Real**:
  - Total de Itens Físicos e Produtos Cadastrados.
  - Total de Categorias Ativas.
  - Alerta de Estoque Baixo / Crítico com badge pulsante.
  - Valor Total do Patrimônio em Estoque (R$).
- **Painel de Ação Imediata (Itens Críticos)**: Lista destacada com cálculo automático de deficit de compra e botão de **Reposição Rápida**.
- **Gráfico de Barras**: Quantidade física e valor por categoria de bancada.
- **Gráfico de Linhas/Área**: Fluxo histórico de Entradas (+) vs Saídas (-) ao longo do tempo.
- **Gráfico de Ranking Horizontal**: Materiais mais utilizados e requisitados no laboratório.

### 2. Estoque & Consulta Avançada
- **Busca Multifuncional**: por nome, código (`ITEM-XXX`), tags (ex: `#arduino`, `#sensor`) ou fornecedor.
- **Filtros Combinados**: por Categoria, Subcategoria dinâmica, Sala/Armário e Status de Estoque (Normal, Baixo, Crítico, Zerado).
- **Alternância de Visualização**: Tabela Completa ou Grade de Cards com fotos.
- **Ficha Técnica & Etiqueta**:
  - Detalhes completos, especificações e observações técnicas.
  - Histórico exclusivo de movimentações daquele item.
  - **Simulador de Etiqueta Física de Bancada** com QR Code para impressão e colagem em gaveteiros.

### 3. Cadastro & Edição de Itens
- Validação completa de campos obrigatórios (nome, categoria, localização, unidade de medida, quantidade mínima e ideal).
- Sistema de Tags dinâmico com chips interativos.
- Seleção visual de localização (Sala > Armário > Prateleira > Posição).
- Seletor de imagens pré-configuradas de laboratório ou URL customizada.
- Regra de negócio: Na edição, a quantidade atual é protegida contra edições diretas, exigindo o registro formal de movimentação.

### 4. Movimentação de Estoque (Entradas, Saídas e Ajustes)
- Busca interativa de itens com cálculo de saldo em tempo real.
- Tipos de operação: **Entrada (+)**, **Saída (-)** e **Ajuste de Inventário (=)**.
- **Validação de Bloqueio**: Impede saídas que superem o saldo disponível no estoque.
- Sugestões rápidas de motivos comuns de laboratório (Aulas práticas, TCC, Manutenção, Compra, Descarte).
- Feed em tempo real das últimas 10 transações realizadas.

### 5. Gestão de Categorias e Localizações
- **Categorias & Subcategorias**: CRUD completo com contador de itens vinculados e bloqueio de exclusão em caso de dependências.
- **Localizações de Bancada**: Cadastro hierárquico de Salas, Armários/Bancadas e Prateleiras/Gaveteiros.

### 6. Relatórios & Exportação CSV
- Tabela de histórico completa com filtros por intervalo de datas, tipo, categoria, item específico e solicitante.
- **Exportação CSV com UTF-8 BOM**: total compatibilidade com Microsoft Excel e acentuação em português (`inventario_laboratorio.csv`, `historico_movimentacoes.csv` e `relatorio_reposicao_estoque_baixo.csv`).

---

## 📁 Estrutura do Código

```
lab-stock-manager/
├── src/
│   ├── types/
│   │   └── inventory.ts         # Tipos e interfaces TypeScript
│   ├── data/
│   │   └── mockData.ts          # Mock inicial com 22 itens e histórico
│   ├── context/
│   │   ├── InventoryContext.tsx # Estado global e persistência em localStorage
│   │   └── ToastContext.tsx     # Notificações flutuantes acessíveis
│   ├── utils/
│   │   ├── formatters.ts        # Moeda BRL, datas, formatadores
│   │   ├── stockUtils.ts        # Cálculo de status (OK, Baixo, Crítico, Zerado)
│   │   └── exportUtils.ts       # Gerador e exportador de arquivos CSV
│   ├── components/
│   │   ├── common/              # Button, Card, Badge, Modal, Toast, EmptyState
│   │   ├── layout/              # AppLayout, Sidebar, Header
│   │   ├── inventory/           # ItemCard, ItemDetailModal, StockHealthGauge
│   │   └── dashboard/           # StatCard, LowStockAlertList, Charts Recharts
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── InventoryListPage.tsx
│   │   ├── ItemFormPage.tsx
│   │   ├── MovementsPage.tsx
│   │   ├── CategoriesLocationsPage.tsx
│   │   └── ReportsPage.tsx
│   ├── App.tsx                  # Rotas React Router
│   ├── main.tsx                 # Ponto de entrada
│   └── index.css                # Tailwind CSS
```

---

## 🛡️ Dados de Demonstração

O sistema vem pré-carregado com mais de 20 itens de demonstração cobrindo:
1. Componentes eletrônicos (Arduino Uno, ESP32 NodeMCU, Sensor Ultrassônico, Displays OLED, Resistores)
2. Instrumentos de medição (Multímetros Minipa, Osciloscópios Hantek, Paquímetros)
3. Materiais 3D / Prototipagem (Filamentos PLA, PETG, Placas Fenolite)
4. Materiais mecânicos (Parafusos M3 Inox, Cabinhos flexíveis)
5. Ferramentas (Estação de solda Hikari, Alicates rente, Sugadores)
6. Consumíveis (Fitas 3M, Pasta térmica Arctic MX-4, Luvas Nitrílicas)
7. Produtos de limpeza (Álcool Isopropílico 99.8%, Papéis de bancada)
8. Materiais administrativos (Etiquetas térmicas Zebra)

*Caso queira restaurar os dados originais do mock a qualquer momento, basta clicar no botão **"Restaurar Mock Inicial"** na barra lateral.*
