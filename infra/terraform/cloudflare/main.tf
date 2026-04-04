provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Cloudflare Pages Project
# サイト自体のデプロイ設定を管理する。DNS レコード（www 以外）は keitaro-yamaguchi リポジトリで管理。

resource "cloudflare_pages_project" "portfolio" {
  account_id        = var.cloudflare_account_id
  name              = "portfolio"
  production_branch = "main"

  source = {
    type = "github"
    config = {
      owner                          = "keitaroooo"
      repo_name                      = "portfolio"
      production_branch              = "main"
      production_deployments_enabled = true
      preview_deployment_setting     = "all"
    }
  }

  build_config = {
    build_command   = ""
    destination_dir = ""
    root_dir        = ""
  }

  deployment_configs = {
    preview = {
      build_image_major_version = 3
    }
    production = {
      build_image_major_version = 3
      # 環境変数が必要になった場合はここに追加
    }
  }
}

# Custom domain for Pages
resource "cloudflare_pages_domain" "www" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.portfolio.name
  name         = "www.keitaroooo.com"
}
