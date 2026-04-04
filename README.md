# portfolio

静的なポートフォリオサイト（`index.html` をルートで配信）。

## Links

- Repo: https://github.com/keitaroooo/portfolio
- URL: https://www.keitaroooo.com

## Local Preview

- ブラウザで `index.html` を直接開く
- もしくは簡易HTTPサーバ

```sh
python3 -m http.server 8000
```

## Infrastructure (IaC)

Cloudflare Pages と DNS レコード（techblog / blog 分を含む）を Terraform で管理している。

- **コード**: [`infra/terraform/cloudflare/`](infra/terraform/cloudflare/)
- **詳細な作業ログ**: [`infra/作業ログ.md`](infra/作業ログ.md)

### DNS / Site Management

- **DNS**: Cloudflare 上で集約管理。`www` は Pages へ、`blog` / `techblog` はそれぞれのホスティング先（Netlify/Vercel）へ向けている。
- **Tokens**: Cloudflare, Vercel, Netlify のトークンは Bitwarden で管理し、`infra/作業ログ.md` に記載の fish 関数等でロードして利用する。

### Deploy (Cloudflare Pages)

- GitHub リポジトリ（このrepo）を Cloudflare Pages に接続し、`main` への push で自動デプロイされる。
- 静的サイトのためビルド設定は不要（Output directory: `/`）。
- 詳細は Terraform の `cloudflare_pages_project` リソースを参照。
