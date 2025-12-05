# Configuração de Domínios Customizados com Cloudflare Worker

Este guia explica como configurar domínios customizados para seus apps usando Cloudflare Workers.

## Arquitetura

```
Domínio do Usuário (meuapp.com)
    ↓ DNS CNAME
Cloudflare Worker
    ↓ Proxy
Seu Next.js (app.seudominio.com)
```

## Setup Inicial (Você - Uma Vez)

### 1. Deploy do Next.js

Faça deploy do seu Next.js na Vercel/Netlify com um domínio fixo:
- Exemplo: `app.seudominio.com`
- Este será o único domínio que você precisa configurar no host

### 2. Criar Cloudflare Worker

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vá em **Workers & Pages** → **Create Worker**
3. Dê um nome: `custom-domains-proxy`
4. Cole o código do arquivo `cloudflare-worker.js`
5. **IMPORTANTE**: Altere a constante `NEXTJS_URL` para seu domínio:
   ```javascript
   const NEXTJS_URL = 'https://app.seudominio.com';
   ```
6. Clique em **Save and Deploy**

### 3. Configurar Variável de Ambiente (Opcional)

Para não hardcodar a URL:

1. No Worker, vá em **Settings** → **Variables**
2. Adicione:
   - Nome: `NEXTJS_URL`
   - Valor: `https://app.seudominio.com`
3. Salve

### 4. Obter URL do Worker

Após deploy, você terá uma URL como:
```
custom-domains-proxy.seuusuario.workers.dev
```

Anote esta URL - será usada pelos usuários finais.

## Configuração do Usuário Final

### Passo 1: Adicionar Domínio no Sistema

1. Acesse a página de apps
2. Clique em **⚙️ Configurações** no app desejado
3. Digite o domínio customizado (ex: `meuapp.com`)
4. Clique em **Salvar Domínio**

### Passo 2: Configurar DNS

O usuário precisa configurar o DNS do domínio dele:

#### Opção A: Domínio Raiz (@)
```
Tipo: CNAME
Nome: @
Valor: custom-domains-proxy.seuusuario.workers.dev
Proxy: ✅ Ativado (laranja) - se usar Cloudflare
```

#### Opção B: Subdomínio
```
Tipo: CNAME
Nome: app (ou qualquer subdomínio)
Valor: custom-domains-proxy.seuusuario.workers.dev
Proxy: ✅ Ativado (laranja) - se usar Cloudflare
```

### Passo 3: Aguardar Propagação

- Pode levar de 5 minutos a 48 horas
- Teste acessando o domínio customizado

## Como Funciona

1. **Usuário acessa**: `meuapp.com`
2. **DNS resolve para**: Cloudflare Worker
3. **Worker consulta**: `app.seudominio.com/api/domains/meuapp.com`
4. **API retorna**: `{ appId: "abc-123" }`
5. **Worker faz proxy para**: `app.seudominio.com/app/abc-123`
6. **Usuário vê**: Conteúdo em `meuapp.com` (URL não muda!)

## Vantagens

✅ **Um único domínio** na Vercel (o seu)  
✅ **Infinitos domínios** de usuários  
✅ **Grátis** (Cloudflare Workers free: 100k req/dia)  
✅ **Rápido** (edge computing global)  
✅ **SSL automático** (Cloudflare gerencia)  
✅ **Sem configuração manual** por domínio  

## Limitações

- **Cloudflare Free**: 100.000 requests/dia
- **Cloudflare Paid** ($5/mês): 10 milhões requests/mês
- Usuário precisa ter acesso ao DNS do domínio
- Propagação DNS pode demorar

## Troubleshooting

### Domínio não funciona

1. Verifique se o DNS está configurado corretamente
2. Teste a propagação: `nslookup meuapp.com`
3. Verifique se o domínio está salvo no sistema
4. Teste a API: `curl https://app.seudominio.com/api/domains/meuapp.com`

### Erro 404

- Domínio não está cadastrado no sistema
- Verifique se o `customDomain` está correto no banco

### Erro 500

- Worker não consegue acessar seu Next.js
- Verifique se `NEXTJS_URL` está correto
- Verifique se a API `/api/domains/[domain]` está acessível

## Monitoramento

No Cloudflare Dashboard:
- **Workers & Pages** → Seu Worker → **Metrics**
- Veja requests, erros, latência
- Logs em tempo real

## Custos

- **Cloudflare Workers Free**: Grátis até 100k req/dia
- **Cloudflare Workers Paid**: $5/mês para 10M req/mês
- **Vercel/Netlify**: Seu plano atual (sem custo adicional)

## Suporte

Para dúvidas ou problemas, entre em contato com o suporte.
