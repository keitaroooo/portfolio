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
