# bkuk — Complete package

Files:
- public/ (admin UI + assets)
- functions/ (Pages Functions / Workers)
- wrangler.toml

Before deploy:
1. Create KV namespace (LINKS) and place IDs in wrangler.toml
2. Set ADMIN_PASSWORD secret in Pages (or via wrangler secret put)
3. Push to GitHub and connect to Cloudflare Pages (Output dir: public)
