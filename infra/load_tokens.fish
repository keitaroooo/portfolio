#!/usr/bin/env fish
# Cloudflare Terraform 用の環境変数をロードする
#
# 使い方:
#   source infra/load_tokens.fish
#   cd infra/terraform/cloudflare && terraform plan

set -gx BW_SESSION (bw unlock --raw)
set -gx TF_VAR_cloudflare_api_token (bw get password "Cloudflare API Token")
set -gx TF_VAR_cloudflare_account_id (bw get password "Cloudflare Account ID")
set -gx TF_VAR_zone_id (bw get password "Cloudflare Zone ID")

echo "✓ TF_VAR_cloudflare_api_token / account_id / zone_id をセットしました"
