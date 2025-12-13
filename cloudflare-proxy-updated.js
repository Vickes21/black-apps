export default {
	async fetch(request, env, ctx) {
		const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Expose-Headers': '*',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const proxyUrl = new URL(request.url);
    let targetUrl = proxyUrl.searchParams.get('url');
    
    if (!targetUrl && proxyUrl.pathname.length > 1) {
      targetUrl = proxyUrl.pathname.slice(1) + proxyUrl.search;
      if (targetUrl.startsWith('http:/') && !targetUrl.startsWith('http://')) {
        targetUrl = targetUrl.replace('http:/', 'http://');
      }
      if (targetUrl.startsWith('https:/') && !targetUrl.startsWith('https://')) {
        targetUrl = targetUrl.replace('https:/', 'https://');
      }
    }

    if (!targetUrl) {
      return new Response('Missing url parameter', { status: 400, headers: corsHeaders });
    }

    try {
      if (targetUrl.includes('%')) {
        targetUrl = decodeURIComponent(targetUrl);
      }

      const targetUrlObj = new URL(targetUrl);
      const baseUrl = targetUrlObj.origin;
      const proxyBaseUrl = `${proxyUrl.origin}?url=`;

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      const contentType = response.headers.get('content-type') || '';
      const newHeaders = new Headers(response.headers);
      
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      newHeaders.delete('X-Frame-Options');
      newHeaders.delete('Content-Security-Policy');
      newHeaders.delete('X-Content-Type-Options');

      // Reescreve URLs em HTML, JavaScript e CSS
      if (contentType.includes('text/html') || 
          contentType.includes('application/javascript') || 
          contentType.includes('text/javascript') ||
          contentType.includes('text/css')) {
        
        let content = await response.text();
        
        // 1. Reescreve URLs absolutas do mesmo domínio
        // "https://destiny-drop-943.notion.site/path" -> "https://proxy.blackapps.online?url=https://destiny-drop-943.notion.site/path"
        const domainPattern = targetUrlObj.hostname.replace(/\./g, '\\.');
        content = content.replace(
          new RegExp(`(["'\`\\s(])https?://${domainPattern}(/[^"'\`\\s)]*)?`, 'gi'),
          `$1${proxyBaseUrl}${baseUrl}$2`
        );
        
        // 2. Reescreve URLs relativas começando com /
        // src="/_assets/file.js" -> src="https://proxy.blackapps.online?url=https://destiny-drop-943.notion.site/_assets/file.js"
        // href="/path" -> href="https://proxy.blackapps.online?url=https://destiny-drop-943.notion.site/path"
        content = content.replace(
          /(src|href|url|content)=(["'])\/([^"']*)(["'])/gi,
          `$1=$2${proxyBaseUrl}${baseUrl}/$3$4`
        );
        
        // 3. Reescreve URLs em CSS: url(/path)
        content = content.replace(
          /url\((["']?)\/([^)"']*)(["']?)\)/gi,
          `url($1${proxyBaseUrl}${baseUrl}/$2$3)`
        );

        return new Response(content, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });

    } catch (error) {
      return new Response(error.message, { status: 500, headers: corsHeaders });
    }
	},
};
