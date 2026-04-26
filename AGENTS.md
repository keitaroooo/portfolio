# AGENTS.md

## Build & Test

```bash
# 静的サイトのためビルド工程なし（HTML/CSS/JS を直接編集）
# 動作確認はブラウザで src/index.html を開いて目視確認
```

## サービス構成

```
src/
├── index.html      → メインページ（静的HTML）
├── assets/         → 画像・CSS
├── sw.js           → Service Worker
└── site.webmanifest
infra/
└── terraform/      → ホスティング設定
```

- 静的サイト（フレームワークなし、素のHTML/CSS/JS）
- ドメイン: `keitaroooo.com`

## インフラ

- **Terraform**: `infra/terraform/`
- **作業ログ**: `infra/作業ログ.md`
