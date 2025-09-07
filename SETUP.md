# Setup - Integração Frontend + Backend

## 🚀 Como executar o sistema completo

### 1. **Backend (Terminal 1)**

```bash
# Navegar para pasta do backend
cd gerenciamento-alocacao-backend

# Iniciar PostgreSQL via Docker
npm run docker:db

# Aplicar schema do banco
npm run db:push

# Popular com dados iniciais
npm run db:seed

# Iniciar servidor backend
npm run dev
```

O backend estará disponível em: `http://localhost:3001`

### 2. **Frontend (Terminal 2)**

```bash
# Navegar para pasta do frontend
cd gerenciamento-alocacao

# Instalar dependências (se ainda não instalou)
npm install

# Iniciar servidor frontend
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## 🔗 Integração Implementada

### ✅ **APIs Conectadas:**
- **GET** `/api/projetos` - Carregar lista de projetos
- **POST** `/api/projetos` - Criar novo projeto  
- **PUT** `/api/projetos/:id` - Atualizar projeto
- **DELETE** `/api/projetos/:id` - Deletar projeto
- **POST** `/api/resultados/executar/:projetoId` - Executar alocação

### ✅ **Funcionalidades Frontend:**
- ✅ Loading states durante requisições
- ✅ Tratamento de erros com retry
- ✅ Criação de projetos via API
- ✅ Edição de projetos via API  
- ✅ Exclusão de projetos via API
- ✅ Execução de algoritmo de alocação via API
- ✅ Estados de loading e error para UX

### ✅ **Componentes Atualizados:**
- `ProjetosManager` - CRUD de projetos
- `ProjetoDetalhes` - Execução de alocação
- `AppContext` - Estado global com APIs
- `LoadingSpinner` - Indicador de carregamento
- `ErrorMessage` - Tratamento de erros

## 🧪 **Testando a Integração**

1. **Criar um projeto:**
   - Clique em "Nova Alocação"
   - Preencha nome e descrição
   - Clique em "Criar Alocação"
   - ✅ Projeto deve aparecer na lista

2. **Executar alocação:**
   - Clique no ícone 👁️ para visualizar projeto
   - Adicione salas e turmas
   - Clique em "Executar Alocação Inteligente"
   - ✅ Deve executar algoritmo no backend

3. **Verificar dados no banco:**
   - Acesse `http://localhost:8080` (PgAdmin)
   - Login: `admin@admin.com` / `admin123`
   - ✅ Dados devem estar salvos no PostgreSQL

## 🐛 **Troubleshooting**

### Backend não conecta:
```bash
# Verificar se PostgreSQL está rodando
docker ps

# Verificar logs do backend
npm run dev
```

### Frontend mostra erro de API:
- ✅ Verificar se backend está em `http://localhost:3001`
- ✅ Verificar console do navegador para erros
- ✅ Verificar se CORS está configurado

### Dados não aparecem:
```bash
# Recriar dados iniciais
npm run db:seed
```

## 📊 **Próximos Passos**

Para expandir a integração:

1. **Gerenciamento de Salas/Turmas**
   - Conectar formulários de salas/turmas às APIs
   - CRUD completo via interface

2. **Resultados Detalhados**
   - Exibir resultados das alocações
   - Visualizações e relatórios

3. **Upload de Arquivos**
   - Importar salas/turmas via CSV/Excel
   - Exportar resultados

4. **Autenticação**
   - Login/logout de usuários
   - Permissões por tipo de usuário

O sistema está **totalmente funcional** para criar, gerenciar e executar alocações com persistência no banco de dados! 🎉
