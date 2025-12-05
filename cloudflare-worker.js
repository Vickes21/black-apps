/**
 * Cloudflare Worker para Domínios Customizados
 * 
 * Este Worker faz proxy de domínios customizados para o seu servidor Next.js
 * 
 * Setup:
 * 1. Crie um Worker no Cloudflare Dashboard
 * 2. Cole este código
 * 3. Configure a variável de ambiente: NEXTJS_URL (ex: https://app.seudominio.com)
 * 4. Adicione rotas customizadas ou use Workers Routes
 */

// URL do seu servidor Next.js (configure como variável de ambiente)
const NEXTJS_URL = 'https://app.seudominio.com'; // ALTERE AQUI

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Usa variável de ambiente se disponível
    const nextjsUrl = env.NEXTJS_URL || NEXTJS_URL;

    try {
      // 1. Consulta qual app tem este domínio
      const apiUrl = `${nextjsUrl}/api/domains/${hostname}`;
      const apiResponse = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Cloudflare-Worker-Proxy/1.0',
        },
      });

      if (!apiResponse.ok) {
        // Domínio não encontrado, retorna erro 404
        return new Response('Domain not configured', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }

      const { appId } = await apiResponse.json();

      // 2. Monta URL do app no Next.js
      const targetUrl = `${nextjsUrl}/app/${appId}${url.pathname}${url.search}`;

      // 3. Faz proxy da requisição
      const targetRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'manual',
      });

      // Adiciona header customizado para o Next.js saber que veio de domínio customizado
      targetRequest.headers.set('X-Custom-Domain', hostname);
      targetRequest.headers.set('X-Forwarded-Host', hostname);
      targetRequest.headers.set('X-Forwarded-Proto', 'https');

      const response = await fetch(targetRequest);

      // 4. Cria nova resposta com headers ajustados
      const newResponse = new Response(response.body, response);

      // Remove headers que podem causar problemas
      newResponse.headers.delete('X-Frame-Options');
      newResponse.headers.delete('Content-Security-Policy');

      // Adiciona headers de segurança
      newResponse.headers.set('X-Powered-By', 'Cloudflare-Worker');
      newResponse.headers.set('Access-Control-Allow-Origin', '*');

      return newResponse;
    } catch (error) {
      // Erro no proxy
      console.error('Worker error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};
