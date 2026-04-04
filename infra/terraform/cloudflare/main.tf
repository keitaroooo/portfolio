provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_dns_record" "apex_a" {
  zone_id  = var.zone_id
  name     = "@"
  type     = "A"
  ttl      = 1
  content  = var.apex_a_value
  proxied  = false
}

resource "cloudflare_dns_record" "blog" {
  zone_id  = var.zone_id
  name     = "blog"
  type     = "CNAME"
  ttl      = 1
  content  = var.blog_netlify_target
  proxied  = true
}

resource "cloudflare_dns_record" "techblog" {
  zone_id  = var.zone_id
  name     = "techblog"
  type     = "CNAME"
  ttl      = 1
  content  = var.techblog_vercel_target
  proxied  = true
}

resource "cloudflare_dns_record" "traefik" {
  zone_id  = var.zone_id
  name     = "traefik"
  type     = "CNAME"
  ttl      = 1
  content  = "keitaroooo.com"
  proxied  = false
}

resource "cloudflare_dns_record" "www" {
  zone_id  = var.zone_id
  name     = "www"
  type     = "CNAME"
  ttl      = 1
  content  = var.www_pages_target
  proxied  = true
}

resource "cloudflare_dns_record" "google_site_verification" {
  zone_id = var.zone_id
  name    = "@"
  type    = "TXT"
  ttl     = 1
  content = var.google_site_verification
}

# Cloudflare Pages Project
resource "cloudflare_pages_project" "portfolio" {
  account_id        = var.cloudflare_account_id
  name              = "portfolio"
  production_branch = "main"

  source = {
    type = "github"
    config = {
      owner                         = "keitaroooo"
      repo_name                     = "portfolio"
      production_branch             = "main"
      production_deployments_enabled = true
      preview_deployment_setting    = "all"
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

