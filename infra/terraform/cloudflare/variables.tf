variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare Account ID"
}

variable "zone_id" {
  type        = string
  description = "Cloudflare Zone ID (keitaroooo.com)"
}

variable "apex_a_value" {
  type        = string
  description = "A record value for keitaroooo.com"
  default     = "60.115.104.27"
}

variable "google_site_verification" {
  type        = string
  description = "TXT record value without quotes"
  default     = "google-site-verification=tORboZBjgFi50WD1Ck_pRZ80-in-L-_QpCwnJtMIdiE"
}

variable "blog_netlify_target" {
  type        = string
  description = "CNAME target for blog.keitaroooo.com"
  default     = "cranky-carson-643be0.netlify.app"
}

variable "techblog_vercel_target" {
  type        = string
  description = "CNAME target for techblog.keitaroooo.com"
  default     = "cname.vercel-dns.com"
}

variable "www_pages_target" {
  type        = string
  description = "CNAME target for www.keitaroooo.com"
  default     = "portfolio-8cs.pages.dev"
}
