# portfolio

静的なポートフォリオサイト（`index.html` をルートで配信）。

## Links

- Repo: https://github.com/keitaroooo/portfolio
- URL: https://www.keitaroooo.com

## Deploy (Cloudflare Pages)

GitHub リポジトリ（このrepo）を Cloudflare Pages に接続し、`main` への push で自動デプロイされる。

- 静的サイトのためビルド設定は不要（Output directory: `/`）。
- **Infrastructure (IaC)**: Pages サイト自体のデプロイ設定を Terraform で管理。
    - コード: [`infra/terraform/cloudflare/`](infra/terraform/cloudflare/)
- **DNS 管理**: 本サイトを含む `keitaroooo.com` 全体の DNS は、[**keitaro-yamaguchi**](https://github.com/keitaroooo/keitaro-yamaguchi) リポジトリで一括管理している。
