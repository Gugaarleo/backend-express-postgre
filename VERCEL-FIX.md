# 🔧 Solução para Erro 404 na Vercel

## �� Problema

Você está recebendo erro **404: NOT_FOUND** ao acessar sua API na Vercel.

## ✅ Solução

A Vercel usa **Serverless Functions** que funcionam de forma diferente de um servidor tradicional. Por isso, fizemos algumas adaptações:

### O que mudou:

1. **Arquivo `api/index.ts` criado** 
   - Este arquivo é a Serverless Function que a Vercel executará
   - Ele importa e reusa toda a lógica das suas rotas existentes

2. **Arquivo `vercel.json` atualizado**
   - Configurado para rotear todas as requisições para `/api`
   
3. **Prefixo `/api` nas rotas**
   - **Local (Docker)**: `http://localhost:3000/register`
   - **Vercel**: `https://sua-api.vercel.app/api/register`

## 📍 Estrutura de URLs

### Desenvolvimento Local (Docker/npm run dev)

```
http://localhost:3000/           → Health check
http://localhost:3000/register   → Registro
http://localhost:3000/login      → Login
http://localhost:3000/protected  → Rota protegida
```

### Produção (Vercel)

```
https://sua-api.vercel.app/api            → Health check
https://sua-api.vercel.app/api/register   → Registro
https://sua-api.vercel.app/api/login      → Login
https://sua-api.vercel.app/api/protected  → Rota protegida
```

## 🚀 Como Fazer Deploy

### Passo 1: Commitar as alterações

```bash
git add .
git commit -m "Fix: Configuração para Vercel Serverless"
git push origin main
```

### Passo 2: Configurar variáveis na Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | String de conexão PostgreSQL (Supabase/Neon/Railway/RDS/etc.) |
| `JWT_SECRET` | Chave secreta forte |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |

### Passo 3: Fazer Redeploy

#### Opção 1: Automático (Git)
- Basta fazer push para o GitHub
- A Vercel detecta e faz deploy automaticamente

#### Opção 2: Manual via Dashboard
1. Vá em **Deployments**
2. Clique em **Redeploy** no último deployment

#### Opção 3: Via CLI
```bash
vercel --prod
```

## 🧪 Testar Após Deploy

```bash
# Substitua SUA-URL pela URL do seu projeto na Vercel

# 1. Health check
curl https://SUA-URL.vercel.app/api

# 2. Registrar usuário
curl -X POST https://SUA-URL.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# 3. Login
curl -X POST https://SUA-URL.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# 4. Acesso protegido (use o token do passo 3)
curl https://SUA-URL.vercel.app/api/protected \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📂 Arquivos Modificados

```
✅ api/index.ts          → Serverless function para Vercel
✅ vercel.json           → Configuração de rotas
✅ DEPLOY.md             → Guia completo atualizado
```

## ⚙️ Como Funciona

### Ambiente Local (Docker)

```
Cliente → Express (porta 3000) → Rotas → Controllers → Services → PostgreSQL (Prisma)
```

### Vercel (Serverless)

```
Cliente → /api → Vercel Function (api/index.ts) → Express → Rotas → Controllers → Services → PostgreSQL gerenciado
```

A diferença é que na Vercel:
- Não há servidor rodando 24/7
- Cada requisição "acorda" uma função serverless
- A função inicializa o cliente Prisma para PostgreSQL (reutilização de instância)
- Processa a requisição
- Retorna a resposta
- "Dorme" novamente

## 🐛 Troubleshooting

### ❌ Ainda recebo 404

**Verifique**:
1. URL está com `/api` no caminho?
   - ❌ `https://app.vercel.app/register`
   - ✅ `https://app.vercel.app/api/register`

2. Fez push das alterações para o Git?
   ```bash
   git status  # Não deve ter arquivos modified
   ```

3. A Vercel fez redeploy após as mudanças?
   - Vá em Deployments e veja o timestamp

### ❌ Erro de conexão com PostgreSQL

1. Variáveis de ambiente configuradas?
   - Settings → Environment Variables
   - Confirme `DATABASE_URL` está lá

2. Banco acessível a partir da Vercel?
   - Libere acesso público no provedor (ou use Connection Pooling)

3. String de conexão correta?
   - Formato: `postgresql://user:pass@host:5432/db?schema=public`
   - Sem `<` ou `>` ao redor da senha

### ❌ Timeout (Function Timeout)

A Vercel tem limite de 10 segundos no plano gratuito.

**Soluções**:
1. O cliente Prisma é inicializado de forma singleton
2. Se ainda assim der timeout, considere:
   - Railway (sem limite de tempo)
   - Render (sem limite de tempo)
   - Vercel Pro (60 segundos)

## 💡 Dica Pro

Use diferentes ambientes no Insomnia:

**Development (Local)**
```yaml
base_url: http://localhost:3000
```

**Production (Vercel)**
```yaml
base_url: https://sua-api.vercel.app/api
```

Assim você alterna entre ambientes facilmente!

## ✅ Checklist Final

Antes de testar na Vercel:

- [ ] Código commitado e pushed para GitHub
- [ ] Banco PostgreSQL configurado
- [ ] IP `0.0.0.0/0` liberado no Atlas
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Deploy feito (manual ou automático)
- [ ] Aguardou build finalizar (~2min)
- [ ] Testando com prefixo `/api` nas URLs

---

**Precisando de ajuda?** Abra um issue ou consulte os logs na aba Deployments da Vercel.
