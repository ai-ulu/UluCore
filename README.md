# UluCore MCP v2.0

<p align="center">
  <strong>Central Policy Engine & SaaS Infrastructure for AI Workflows</strong><br>
  <em>Policy management, rate limiting, Stripe billing, webhooks — the backbone of your AI platform</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0-blue?style=for-the-badge" alt="Version 2.0">
  <img src="https://img.shields.io/badge/MCP-Streamable_HTTP-green?style=for-the-badge" alt="MCP Streamable HTTP">
  <img src="https://img.shields.io/badge/Cloudflare-Pages-orange?style=for-the-badge" alt="Cloudflare Pages">
  <img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="MIT License">
</p>

---

## 🚀 Live Endpoint

```
https://ulucore-mcp.pages.dev/mcp
```

Connect any MCP-compatible client using **Streamable HTTP** transport.

## 🛠️ Tools (16)

### Core Action & Policy

| # | Tool | Description |
|---|------|-------------|
| 1 | `process_action` | Process an action through the policy engine |
| 2 | `create_policy` | Create a new governance policy |
| 3 | `list_policies` | List all policies with optional filters |
| 4 | `update_policy` | Update an existing policy |
| 5 | `delete_policy` | Delete a policy by ID |
| 6 | `simulate_policy` | Simulate policy execution without side effects |

### Events & Metrics

| # | Tool | Description |
|---|------|-------------|
| 7 | `get_events` | Retrieve event log with filtering |
| 8 | `get_metrics` | Get system metrics and analytics |

### Auth & Billing

| # | Tool | Description |
|---|------|-------------|
| 9 | `signup` | Register a new user account |
| 10 | `create_api_key` | Generate a new API key for a user |
| 11 | `get_billing_plans` | List available billing plans |

### v2.0 — SaaS Infrastructure

| # | Tool | Description |
|---|------|-------------|
| 12 | `uc_role_management` | Manage user roles and permissions (RBAC) |
| 13 | `uc_policy_versioning` | Version control for policies with rollback support |
| 14 | `uc_webhook_notifications` | Configure and manage webhook notifications |
| 15 | `uc_rate_limiting` | Configure API rate limiting per user/plan |
| 16 | `uc_stripe_integration` | Stripe billing integration — subscriptions, invoices, payments |

## 📦 Installation

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "ulucore": {
      "url": "https://ulucore-mcp.pages.dev/mcp"
    }
  }
}
```

### Cursor / VS Code

```json
{
  "mcp": {
    "servers": {
      "ulucore": {
        "url": "https://ulucore-mcp.pages.dev/mcp",
        "transport": "streamable-http"
      }
    }
  }
}
```

## 🔧 Local Development

```bash
pnpm install
pnpm build
pnpm deploy
pnpm start
```

## 🏗️ Architecture

- **Runtime**: Cloudflare Workers (Edge)
- **Database**: Cloudflare D1 (SQLite)
- **Transport**: MCP Streamable HTTP
- **Protocol**: JSON-RPC 2.0
- **Integrations**: Stripe, Webhooks, RBAC

## 📋 Version History

| Version | Changes |
|---------|---------|
| v2.0 | Added RBAC, policy versioning, webhooks, rate limiting, Stripe integration; migrated to Cloudflare Pages |
| v1.0 | Initial release with core policy engine, auth, and billing |

---

<p align="center">
  Built by <a href="https://github.com/ai-ulu">ai-ulu</a> · Part of the MCP Toolkit
</p>
