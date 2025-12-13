// Substitua pela URL do seu Cloudflare Worker
const PROXY_URL = 'https://proxy.blackapps.online?url=';

customElements.define('x-frame-bypass', class extends HTMLIFrameElement {
    static get observedAttributes() {
        return ['src']
    }
    
    constructor() {
        super()
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'src' && newValue && newValue !== oldValue) {
            this.load(newValue)
        }
    }
    
    connectedCallback() {
        this.sandbox = 'allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation'
    }
    
    load(url) {
        if (!url || !url.startsWith('http')) return
        
        fetch(PROXY_URL + encodeURIComponent(url))
            .then(res => res.text())
            .then(html => {
                this.srcdoc = html
                    .replace(/<head([^>]*)>/i, `<head$1>
                        <base href="${url}">
                        <script>
                            document.addEventListener('click', e => {
                                const link = e.target.closest('a[href]')
                                if (link && frameElement && frameElement.load) {
                                    const href = link.href
                                    if (href.startsWith('http')) {
                                        e.preventDefault()
                                        frameElement.load(href)
                                    }
                                }
                            }, true)
                        </script>
                    `)
                    .replace(/crossorigin="[^"]*"/gi, '')
                    .replace(/integrity="[^"]*"/gi, '')
            })
            .catch(err => console.error('X-Frame-Bypass:', err))
    }
}, { extends: 'iframe' })