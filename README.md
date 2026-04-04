# Keitarooo Portfolio

静的なポートフォリオサイト（WebGLエフェクト付き）。

## 🚀 Features

- **WebGL Effects**: 3Dパーティクル、シェーダー背景、立方体アニメーション
- **PWA対応**: Service Worker、オフライン対応
- **レスポンシブ**: モバイル最適化
- **外部シェーダー**: GLSLコードの分離

## 📁 プロジェクト構成

```
portfolio/
├── docker-compose.yml   # 複数コンテナの定義（Webサーバーのみ）
├── default.conf         # Nginxの設定ファイル
├── src/                 # Webサイトのソースコード一式
│   ├── index.html
│   ├── main.js          # WebGLのロジック（立方体）
│   ├── assets/          # CSS・JS
│   │   ├── css/
│   │   └── js/
│   ├── shaders/         # GLSLシェーダーコード
│   │   ├── vertex.glsl
│   │   └── fragment.glsl
│   ├── site.webmanifest # PWA設定
│   ├── sw.js            # Service Worker
│   ├── favicon.svg
│   └── icon.svg
└── README.md
```

## 🛠️ 開発環境

```bash
# ローカルサーバー
npm run serve

# Docker本番
npm run docker:prod
```

## 🌐 Links

- **Repo**: https://github.com/keitaroooo/portfolio
- **URL**: https://www.keitaroooo.com

## 🚀 Deploy (Cloudflare Pages)

GitHubリポジトリをCloudflare Pagesに接続し、`main`へのpushで自動デプロイされる。

- **ビルド設定**: 不要（静的サイト）
- **出力先**: `src/` ディレクトリ
- **Infrastructure**: Terraformで管理 ([`infra/terraform/cloudflare/`](infra/terraform/cloudflare/))
- **DNS管理**: [keitaro-yamaguchi](https://github.com/keitaroooo/keitaro-yamaguchi)で一括管理

## 🎨 WebGL Features

- **3D Particles**: 球面分布、螺旋運動、マウスインタラクション
- **Shader Background**: 動的ノイズ、時間ベースの色変化
- **3D Objects**: 回転するカラフルな立方体
- **外部シェーダー**: `shaders/vertex.glsl`, `shaders/fragment.glsl`
- **Fallback**: WebGL非対応ブラウザ対応

## 📱 PWA Features

- **Service Worker**: キャッシュ戦略、オフライン対応
- **Manifest**: ホーム画面追加対応
- **Responsive**: モバイル最適化表示
