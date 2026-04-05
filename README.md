# portfolio

静的なポートフォリオサイト（WebGLエフェクト付き）。

## Links

- Repo: https://github.com/keitaroooo/portfolio
- URL: https://www.keitaroooo.com

## Deploy (Cloudflare Pages)

GitHub リポジトリ（このrepo）を Cloudflare Pages に接続し、`main` への push で自動デプロイされる。

- 静的サイトのためビルド設定は不要（Output directory: `/`）。
- **Infrastructure (IaC)**: Pages サイト自体のデプロイ設定を Terraform で管理。詳細な手順は [keitaro-yamaguchi/infra/作業ログ.md](https://github.com/keitaroooo/keitaro-yamaguchi/blob/main/infra/作業ログ.md) を参照。
- **DNS 管理**: 本サイトを含む `keitaroooo.com` 全体の DNS は、[**keitaro-yamaguchi**](https://github.com/keitaroooo/keitaro-yamaguchi) リポジトリで一括管理している。

## 🎨 WebGL Features

- **3D Particles**: 球面分布、螺旋運動、マウスインタラクション
- **Shader Background**: 動的ノイズ、時間ベースの色変化
- **3D Objects**: 回転するカラフルな立方体
- **External Shaders**: `shaders/vertex.glsl`, `shaders/fragment.glsl`
- **Fallback**: WebGL非対応ブラウザ対応

## 📱 PWA Features

- **Service Worker**: キャッシュ戦略、オフライン対応
- **Manifest**: ホーム画面追加対応
- **Responsive**: モバイル最適化表示
