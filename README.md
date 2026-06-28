# portfolio

静的ポートフォリオサイト。Cloudflare Pages。WebGL + PWA。

- **URL**: https://www.keitaroooo.com
- **App**: `src/`

## Infra

- **デプロイ**: Cloudflare Pages（`infra/terraform/cloudflare/`）— `main` push で自動デプロイ
- **DNS**: [`keitaro-yamaguchi`](https://github.com/keitaroooo/keitaro-yamaguchi) で一元管理

### Terraform

コード: [`infra/terraform/cloudflare/`](infra/terraform/cloudflare/)

| リソース | 説明 |
| --- | --- |
| `cloudflare_pages_project.portfolio` | Cloudflare Pages（静的サイト, root: `src`） |
| `cloudflare_pages_domain.www` | カスタムドメイン `www.keitaroooo.com` |

```fish
source infra/load_tokens.fish
cd infra/terraform/cloudflare
terraform init && terraform plan && terraform apply
```

import ブロックは `main.tf` に記載済み。Bitwarden Item 名は keitaro-yamaguchi / 他リポと同じ。
