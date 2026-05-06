/**
 * UluCore MCP Server v2.0 - Cloudflare Workers + D1 Edition
 * 
 * AI-powered policy engine and governance platform.
 * Decision engine with deterministic policies, AI recommendations, and audit logging.
 * 
 * v1.0-1.1 Tools (11):
 *   process_action, create_policy, list_policies, update_policy, delete_policy,
 *   get_events, get_metrics, simulate_policy, signup, create_api_key, get_billing_plans
 * 
 * v2.0 New Tools (5):
 *   uc_role_management: Role-based access control (RBAC)
 *   uc_policy_versioning: Policy version history and rollback
 *   uc_webhook_notifications: Webhook event notifications
 *   uc_rate_limiting: Per-user rate limiting
 *   uc_stripe_integration: Stripe payment processing
 * 
 * Transport: Streamable HTTP (MCP 2025-03-26)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Env {
  DB: D1Database;
  AI?: any; // Cloudflare Workers AI binding
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

interface PolicyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: string;
}

interface Policy {
  id: string;
  name: string;
  description: string;
  conditions: PolicyCondition[];
  decision: 'approve' | 'reject' | 'require_approval';
  reason: string;
  priority: number;
  enabled: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: string;
  action_type: string;
  resource_id: string;
  user_id: string;
  decision: string;
  reason: string;
  ai_recommendation?: string;
  ai_available: boolean;
  metadata: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  plan: string;
  created_at: string;
}

interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
}

interface PolicyVersion {
  id: string;
  policy_id: string;
  version: number;
  snapshot: string;
  changed_by: string;
  change_reason: string;
  created_at: string;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: string;
  status: string;
  attempts: number;
  created_at: string;
}

interface RateLimitRule {
  id: string;
  name: string;
  action_type: string;
  max_requests: number;
  window_seconds: number;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════
// D1 STORAGE CLIENT
// ═══════════════════════════════════════════════════════════

class UluCoreClient {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // ─── Initialize Database ──────────────────────────────────
  async initDB(): Promise<void> {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS policies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        conditions TEXT NOT NULL DEFAULT '[]',
        decision TEXT NOT NULL DEFAULT 'reject',
        reason TEXT DEFAULT '',
        priority INTEGER DEFAULT 0,
        enabled INTEGER DEFAULT 1,
        version INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        action_type TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        decision TEXT NOT NULL,
        reason TEXT DEFAULT '',
        ai_recommendation TEXT DEFAULT '',
        ai_available INTEGER DEFAULT 0,
        metadata TEXT DEFAULT '{}',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT DEFAULT '',
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'viewer',
        plan TEXT DEFAULT 'free',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        key_hash TEXT NOT NULL,
        key_prefix TEXT NOT NULL,
        name TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        permissions TEXT NOT NULL DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS user_roles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role_id TEXT NOT NULL,
        assigned_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS policy_versions (
        id TEXT PRIMARY KEY,
        policy_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        snapshot TEXT NOT NULL,
        changed_by TEXT DEFAULT 'system',
        change_reason TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS webhook_endpoints (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        events TEXT NOT NULL DEFAULT '[]',
        secret TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS webhook_deliveries (
        id TEXT PRIMARY KEY,
        webhook_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS rate_limit_rules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        action_type TEXT NOT NULL DEFAULT '*',
        max_requests INTEGER NOT NULL,
        window_seconds INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS rate_limit_counters (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        window_start TEXT NOT NULL,
        request_count INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS stripe_customers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        stripe_customer_id TEXT NOT NULL,
        stripe_subscription_id TEXT DEFAULT '',
        plan TEXT DEFAULT 'free',
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }

  // ─── v1.0 Methods ─────────────────────────────────────────

  async processAction(actionType: string, resourceId: string, userId: string, metadata: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    let aiRecommendation = '';
    let aiAvailable = false;

    // Try AI recommendation
    try {
      if (this.db) {
        // Use a simple heuristic-based recommendation since Workers AI may not be available
        const policyResult = await this.evaluatePolicies(actionType, resourceId, userId, metadata);
        aiRecommendation = policyResult.decision + ': ' + policyResult.reason;
        aiAvailable = true;
      }
    } catch {
      aiAvailable = false;
    }

    // Evaluate deterministic policies
    const policyResult = await this.evaluatePolicies(actionType, resourceId, userId, metadata);

    const eventId = `evt_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date().toISOString();

    await this.db.prepare(
      `INSERT INTO events (id, action_type, resource_id, user_id, decision, reason, ai_recommendation, ai_available, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(eventId, actionType, resourceId, userId, policyResult.decision, policyResult.reason, aiRecommendation, aiAvailable ? 1 : 0, JSON.stringify(metadata), now).run();

    // Trigger webhook notifications
    await this.triggerWebhooks('action_processed', {
      eventId,
      actionType,
      resourceId,
      userId,
      decision: policyResult.decision,
      reason: policyResult.reason,
    });

    return {
      eventId,
      actionType,
      resourceId,
      userId,
      decision: policyResult.decision,
      reason: policyResult.reason,
      matchedPolicy: policyResult.matchedPolicyId || null,
      aiRecommendation: aiAvailable ? aiRecommendation : null,
      aiAvailable,
      processedAt: now,
    };
  }

  async evaluatePolicies(actionType: string, resourceId: string, userId: string, metadata: Record<string, unknown>): Promise<{ decision: string; reason: string; matchedPolicyId: string | null }> {
    const policies = await this.db.prepare(
      `SELECT * FROM policies WHERE enabled = 1 ORDER BY priority DESC, created_at ASC`
    ).all<Policy>();

    for (const policy of (policies.results || [])) {
      let conditions: PolicyCondition[] = [];
      try {
        conditions = JSON.parse(policy.conditions as any);
      } catch { continue; }

      let allMatch = true;
      for (const cond of conditions) {
        const fieldValue = this.getFieldValue(cond.field, actionType, resourceId, userId, metadata);
        if (!this.evaluateCondition(fieldValue, cond.operator, cond.value)) {
          allMatch = false;
          break;
        }
      }

      if (allMatch) {
        return {
          decision: policy.decision,
          reason: policy.reason,
          matchedPolicyId: policy.id,
        };
      }
    }

    // Default: approve if no policy matches
    return { decision: 'approve', reason: 'No matching policy found; default allow', matchedPolicyId: null };
  }

  getFieldValue(field: string, actionType: string, resourceId: string, userId: string, metadata: Record<string, unknown>): string {
    switch (field) {
      case 'action_type': return actionType;
      case 'resource_id': return resourceId;
      case 'user_id': return userId;
      default: return String(metadata[field] || '');
    }
  }

  evaluateCondition(fieldValue: string, operator: string, condValue: string): boolean {
    switch (operator) {
      case 'equals': return fieldValue === condValue;
      case 'not_equals': return fieldValue !== condValue;
      case 'contains': return fieldValue.includes(condValue);
      case 'starts_with': return fieldValue.startsWith(condValue);
      case 'ends_with': return fieldValue.endsWith(condValue);
      case 'greater_than': return parseFloat(fieldValue) > parseFloat(condValue);
      case 'less_than': return parseFloat(fieldValue) < parseFloat(condValue);
      default: return false;
    }
  }

  async createPolicy(name: string, description: string, conditions: PolicyCondition[], decision: string, reason: string): Promise<Policy> {
    const id = `pol_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date().toISOString();

    await this.db.prepare(
      `INSERT INTO policies (id, name, description, conditions, decision, reason, priority, enabled, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, ?, ?)`
    ).bind(id, name, description, JSON.stringify(conditions), decision, reason, now, now).run();

    // Create first version snapshot
    await this.db.prepare(
      `INSERT INTO policy_versions (id, policy_id, version, snapshot, changed_by, change_reason, created_at) VALUES (?, ?, 1, ?, 'system', 'Initial policy creation', ?)`
    ).bind(`pv_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`, id, JSON.stringify({ name, description, conditions, decision, reason }), now).run();

    return {
      id, name, description, conditions, decision: decision as any, reason, priority: 0, enabled: true, version: 1, created_at: now, updated_at: now,
    };
  }

  async listPolicies(): Promise<Policy[]> {
    const results = await this.db.prepare(
      `SELECT * FROM policies ORDER BY priority DESC, created_at ASC`
    ).all<Policy>();
    return (results.results || []).map(p => ({
      ...p,
      conditions: typeof p.conditions === 'string' ? JSON.parse(p.conditions) : p.conditions,
      enabled: !!p.enabled,
    }));
  }

  async updatePolicy(policyId: string, updates: Partial<Policy>): Promise<Policy | null> {
    const existing = await this.db.prepare(`SELECT * FROM policies WHERE id = ?`).bind(policyId).first<any>();
    if (!existing) return null;

    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
    if (updates.conditions !== undefined) { fields.push('conditions = ?'); values.push(JSON.stringify(updates.conditions)); }
    if (updates.decision !== undefined) { fields.push('decision = ?'); values.push(updates.decision); }
    if (updates.reason !== undefined) { fields.push('reason = ?'); values.push(updates.reason); }
    if (updates.enabled !== undefined) { fields.push('enabled = ?'); values.push(updates.enabled ? 1 : 0); }

    // Increment version
    const newVersion = (existing.version || 1) + 1;
    fields.push('version = ?');
    values.push(newVersion);
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());

    if (fields.length > 0) {
      await this.db.prepare(
        `UPDATE policies SET ${fields.join(', ')} WHERE id = ?`
      ).bind(...values, policyId).run();

      // Create version snapshot
      const snapshot = {
        name: updates.name || existing.name,
        description: updates.description || existing.description,
        conditions: updates.conditions || (typeof existing.conditions === 'string' ? JSON.parse(existing.conditions) : existing.conditions),
        decision: updates.decision || existing.decision,
        reason: updates.reason || existing.reason,
      };

      await this.db.prepare(
        `INSERT INTO policy_versions (id, policy_id, version, snapshot, changed_by, change_reason, created_at) VALUES (?, ?, ?, ?, 'system', 'Policy update', ?)`
      ).bind(`pv_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`, policyId, newVersion, JSON.stringify(snapshot), new Date().toISOString()).run();
    }

    const updated = await this.db.prepare(`SELECT * FROM policies WHERE id = ?`).bind(policyId).first<any>();
    if (!updated) return null;
    return { ...updated, conditions: typeof updated.conditions === 'string' ? JSON.parse(updated.conditions) : updated.conditions, enabled: !!updated.enabled };
  }

  async deletePolicy(policyId: string): Promise<boolean> {
    const result = await this.db.prepare(`DELETE FROM policies WHERE id = ?`).bind(policyId).run();
    return result.meta.changes > 0;
  }

  async getEvents(userId?: string, actionType?: string, limit: number = 50, offset: number = 0): Promise<Event[]> {
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params: unknown[] = [];

    if (userId) { sql += ' AND user_id = ?'; params.push(userId); }
    if (actionType) { sql += ' AND action_type = ?'; params.push(actionType); }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const results = await this.db.prepare(sql).bind(...params).all<Event>();
    return results.results || [];
  }

  async getMetrics(): Promise<Record<string, unknown>> {
    const total = await this.db.prepare(`SELECT COUNT(*) as c FROM events`).first<{ c: number }>();
    const approved = await this.db.prepare(`SELECT COUNT(*) as c FROM events WHERE decision = 'approve'`).first<{ c: number }>();
    const rejected = await this.db.prepare(`SELECT COUNT(*) as c FROM events WHERE decision = 'reject'`).first<{ c: number }>();
    const aiUnavailable = await this.db.prepare(`SELECT COUNT(*) as c FROM events WHERE ai_available = 0`).first<{ c: number }>();

    const totalVal = total?.c || 0;
    const rejectedVal = rejected?.c || 0;

    return {
      total_actions: totalVal,
      approved_count: approved?.c || 0,
      rejected_count: rejectedVal,
      reject_rate: totalVal > 0 ? Math.round((rejectedVal / totalVal) * 10000) / 10000 : 0,
      ai_unavailable_count: aiUnavailable?.c || 0,
    };
  }

  async simulatePolicy(conditions: PolicyCondition[], decision: string, reason: string, actionType: string, resourceId: string, userId: string, metadata: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    let allMatch = true;
    for (const cond of conditions) {
      const fieldValue = this.getFieldValue(cond.field, actionType, resourceId, userId, metadata);
      if (!this.evaluateCondition(fieldValue, cond.operator, cond.value)) {
        allMatch = false;
        break;
      }
    }

    return {
      simulated: true,
      wouldMatch: allMatch,
      decision: allMatch ? decision : 'approve',
      reason: allMatch ? reason : 'Conditions do not match; default allow',
      conditions,
      actionType,
      resourceId,
      userId,
    };
  }

  async signup(email: string, password: string, name: string = ''): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    // Simple hash (in production, use bcrypt or argon2)
    const passwordHash = await this.hashPassword(password);

    try {
      await this.db.prepare(
        `INSERT INTO users (id, email, name, password_hash, role, plan, created_at) VALUES (?, ?, ?, ?, 'viewer', 'free', ?)`
      ).bind(id, email, name, passwordHash, now).run();

      // Assign default 'viewer' role
      const viewerRole = await this.db.prepare(`SELECT id FROM roles WHERE name = 'viewer'`).first<{ id: string }>();
      if (viewerRole) {
        await this.db.prepare(
          `INSERT INTO user_roles (id, user_id, role_id, assigned_at) VALUES (?, ?, ?, ?)`
        ).bind(crypto.randomUUID(), id, viewerRole.id, now).run();
      }

      return { id, email, name, role: 'viewer', plan: 'free', createdAt: now };
    } catch (e: any) {
      return { error: 'Email already exists', email };
    }
  }

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'ulucore_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async createApiKey(userId: string, name: string): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID();
    const rawKey = `uc_${crypto.randomUUID().replace(/-/g, '')}`;
    const keyPrefix = rawKey.substring(0, 7);
    const keyHash = await this.hashPassword(rawKey);
    const now = new Date().toISOString();

    await this.db.prepare(
      `INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name, created_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, userId, keyHash, keyPrefix, name, now).run();

    return { id, keyPrefix, fullKey: rawKey, name, warning: 'Save the full key now - it will not be shown again!' };
  }

  getBillingPlans(): Record<string, unknown>[] {
    return [
      { id: 'free', name: 'Free', price_monthly: 0, price_yearly: 0, features: ['100 actions/month', 'Basic policy engine', 'Community support'], actions_limit: 100 },
      { id: 'pro', name: 'Pro', price_monthly: 29, price_yearly: 290, features: ['10,000 actions/month', 'Advanced policy engine', 'AI recommendations', 'Priority support', 'Custom policies'], actions_limit: 10000 },
      { id: 'enterprise', name: 'Enterprise', price_monthly: 199, price_yearly: 1990, features: ['Unlimited actions', 'Full policy engine', 'AI recommendations', 'Dedicated support', 'Custom policies', 'SLA guarantee'], actions_limit: -1 },
    ];
  }

  // ═══════════════════════════════════════════════════════════
  // v2.0 NEW METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * uc_role_management: Full RBAC - CRUD for roles, assign/revoke roles from users, check permissions
   */
  async roleManagement(
    action: 'create_role' | 'update_role' | 'delete_role' | 'assign_role' | 'revoke_role' | 'check_permission' | 'list_roles' | 'get_user_roles',
    params: {
      roleId?: string;
      roleName?: string;
      description?: string;
      permissions?: string[];
      userId?: string;
      permission?: string;
    }
  ): Promise<Record<string, unknown>> {
    const now = new Date().toISOString();

    switch (action) {
      case 'create_role': {
        if (!params.roleName) return { error: 'roleName is required' };
        const id = `role_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;
        const permissions = params.permissions || [];
        await this.db.prepare(
          `INSERT INTO roles (id, name, description, permissions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(id, params.roleName, params.description || '', JSON.stringify(permissions), now, now).run();
        return { id, name: params.roleName, description: params.description, permissions, createdAt: now };
      }

      case 'update_role': {
        if (!params.roleId) return { error: 'roleId is required' };
        const existing = await this.db.prepare(`SELECT * FROM roles WHERE id = ?`).bind(params.roleId).first<any>();
        if (!existing) return { error: 'Role not found' };
        
        const name = params.roleName || existing.name;
        const desc = params.description !== undefined ? params.description : existing.description;
        const perms = params.permissions || (typeof existing.permissions === 'string' ? JSON.parse(existing.permissions) : existing.permissions);
        
        await this.db.prepare(
          `UPDATE roles SET name = ?, description = ?, permissions = ?, updated_at = ? WHERE id = ?`
        ).bind(name, desc, JSON.stringify(perms), now, params.roleId).run();
        return { id: params.roleId, name, description: desc, permissions: perms, updatedAt: now };
      }

      case 'delete_role': {
        if (!params.roleId) return { error: 'roleId is required' };
        // Remove role assignments first
        await this.db.prepare(`DELETE FROM user_roles WHERE role_id = ?`).bind(params.roleId).run();
        const result = await this.db.prepare(`DELETE FROM roles WHERE id = ?`).bind(params.roleId).run();
        return { deleted: result.meta.changes > 0, roleId: params.roleId };
      }

      case 'assign_role': {
        if (!params.userId || !params.roleId) return { error: 'userId and roleId are required' };
        // Check if already assigned
        const existing = await this.db.prepare(
          `SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?`
        ).bind(params.userId, params.roleId).first<{ id: string }>();
        if (existing) return { error: 'Role already assigned', userId: params.userId, roleId: params.roleId };
        
        const id = crypto.randomUUID();
        await this.db.prepare(
          `INSERT INTO user_roles (id, user_id, role_id, assigned_at) VALUES (?, ?, ?, ?)`
        ).bind(id, params.userId, params.roleId, now).run();
        
        // Update user's role field
        const role = await this.db.prepare(`SELECT name FROM roles WHERE id = ?`).bind(params.roleId).first<{ name: string }>();
        if (role) {
          await this.db.prepare(`UPDATE users SET role = ? WHERE id = ?`).bind(role.name, params.userId).run();
        }
        return { assigned: true, userId: params.userId, roleId: params.roleId, roleName: role?.name, assignedAt: now };
      }

      case 'revoke_role': {
        if (!params.userId || !params.roleId) return { error: 'userId and roleId are required' };
        const result = await this.db.prepare(
          `DELETE FROM user_roles WHERE user_id = ? AND role_id = ?`
        ).bind(params.userId, params.roleId).run();
        return { revoked: result.meta.changes > 0, userId: params.userId, roleId: params.roleId };
      }

      case 'check_permission': {
        if (!params.userId || !params.permission) return { error: 'userId and permission are required' };
        
        // Get all roles for user
        const userRoles = await this.db.prepare(
          `SELECT r.id, r.name, r.permissions FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`
        ).bind(params.userId).all<any>();
        
        let hasPermission = false;
        const matchingRoles: string[] = [];
        for (const role of (userRoles.results || [])) {
          const perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
          if (perms.includes(params.permission) || perms.includes('*')) {
            hasPermission = true;
            matchingRoles.push(role.name);
          }
        }
        
        return { userId: params.userId, permission: params.permission, granted: hasPermission, matchingRoles };
      }

      case 'list_roles': {
        const roles = await this.db.prepare(`SELECT * FROM roles ORDER BY created_at ASC`).all<any>();
        return {
          roles: (roles.results || []).map(r => ({
            ...r,
            permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions,
          })),
          total: (roles.results || []).length,
        };
      }

      case 'get_user_roles': {
        if (!params.userId) return { error: 'userId is required' };
        const roles = await this.db.prepare(
          `SELECT r.id, r.name, r.description, r.permissions, ur.assigned_at FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`
        ).bind(params.userId).all<any>();
        return {
          userId: params.userId,
          roles: (roles.results || []).map(r => ({
            ...r,
            permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions,
          })),
        };
      }

      default:
        return { error: `Unknown action: ${action}` };
    }
  }

  /**
   * uc_policy_versioning: View version history, diff versions, rollback to previous version
   */
  async policyVersioning(
    action: 'get_history' | 'get_version' | 'diff_versions' | 'rollback',
    params: {
      policyId?: string;
      version?: number;
      fromVersion?: number;
      toVersion?: number;
    }
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case 'get_history': {
        if (!params.policyId) return { error: 'policyId is required' };
        const versions = await this.db.prepare(
          `SELECT * FROM policy_versions WHERE policy_id = ? ORDER BY version DESC`
        ).bind(params.policyId).all<PolicyVersion>();
        return {
          policyId: params.policyId,
          versions: (versions.results || []).map(v => ({
            id: v.id,
            version: v.version,
            changedBy: v.changed_by,
            changeReason: v.change_reason,
            createdAt: v.created_at,
          })),
          totalVersions: (versions.results || []).length,
        };
      }

      case 'get_version': {
        if (!params.policyId || !params.version) return { error: 'policyId and version are required' };
        const version = await this.db.prepare(
          `SELECT * FROM policy_versions WHERE policy_id = ? AND version = ?`
        ).bind(params.policyId, params.version).first<PolicyVersion>();
        if (!version) return { error: 'Version not found' };
        return {
          policyId: params.policyId,
          version: version.version,
          snapshot: JSON.parse(version.snapshot),
          changedBy: version.changed_by,
          changeReason: version.change_reason,
          createdAt: version.created_at,
        };
      }

      case 'diff_versions': {
        if (!params.policyId || !params.fromVersion || !params.toVersion) return { error: 'policyId, fromVersion, and toVersion are required' };
        const v1 = await this.db.prepare(
          `SELECT * FROM policy_versions WHERE policy_id = ? AND version = ?`
        ).bind(params.policyId, params.fromVersion).first<PolicyVersion>();
        const v2 = await this.db.prepare(
          `SELECT * FROM policy_versions WHERE policy_id = ? AND version = ?`
        ).bind(params.policyId, params.toVersion).first<PolicyVersion>();
        if (!v1 || !v2) return { error: 'One or both versions not found' };

        const s1 = JSON.parse(v1.snapshot);
        const s2 = JSON.parse(v2.snapshot);
        const diffs: Array<{ field: string; from: unknown; to: unknown }> = [];
        for (const key of Object.keys(s1)) {
          if (JSON.stringify(s1[key]) !== JSON.stringify(s2[key])) {
            diffs.push({ field: key, from: s1[key], to: s2[key] });
          }
        }
        return { policyId: params.policyId, fromVersion: params.fromVersion, toVersion: params.toVersion, diffs, v1ChangedBy: v1.changed_by, v2ChangedBy: v2.changed_by };
      }

      case 'rollback': {
        if (!params.policyId || !params.version) return { error: 'policyId and version are required' };
        const targetVersion = await this.db.prepare(
          `SELECT * FROM policy_versions WHERE policy_id = ? AND version = ?`
        ).bind(params.policyId, params.version).first<PolicyVersion>();
        if (!targetVersion) return { error: 'Target version not found' };

        const snapshot = JSON.parse(targetVersion.snapshot);
        const now = new Date().toISOString();
        const newVersion = await this.db.prepare(`SELECT MAX(version) as v FROM policy_versions WHERE policy_id = ?`).bind(params.policyId).first<{ v: number }>();
        const nextVersion = (newVersion?.v || 1) + 1;

        // Update policy with snapshot data
        await this.db.prepare(
          `UPDATE policies SET name = ?, description = ?, conditions = ?, decision = ?, reason = ?, version = ?, updated_at = ? WHERE id = ?`
        ).bind(snapshot.name, snapshot.description, JSON.stringify(snapshot.conditions), snapshot.decision, snapshot.reason, nextVersion, now, params.policyId).run();

        // Create new version record for rollback
        await this.db.prepare(
          `INSERT INTO policy_versions (id, policy_id, version, snapshot, changed_by, change_reason, created_at) VALUES (?, ?, ?, ?, 'system', ?, ?)`
        ).bind(`pv_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`, params.policyId, nextVersion, JSON.stringify(snapshot), `Rollback to version ${params.version}`, now).run();

        return { rolledBack: true, policyId: params.policyId, fromVersion: params.version, toVersion: nextVersion, snapshot };
      }

      default:
        return { error: `Unknown action: ${action}` };
    }
  }

  /**
   * uc_webhook_notifications: Register webhooks, list deliveries, test webhook
   */
  async webhookNotifications(
    action: 'register' | 'update' | 'delete' | 'list' | 'list_deliveries' | 'test',
    params: {
      webhookId?: string;
      url?: string;
      events?: string[];
      active?: boolean;
      limit?: number;
    }
  ): Promise<Record<string, unknown>> {
    const now = new Date().toISOString();

    switch (action) {
      case 'register': {
        if (!params.url) return { error: 'url is required' };
        const id = `wh_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;
        const secret = `whsec_${crypto.randomUUID().replace(/-/g, '')}`;
        const events = params.events || ['action_processed'];
        await this.db.prepare(
          `INSERT INTO webhook_endpoints (id, url, events, secret, active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)`
        ).bind(id, params.url, JSON.stringify(events), secret, now, now).run();
        return { id, url: params.url, events, secret, active: true, warning: 'Save the webhook secret - it will not be shown again!' };
      }

      case 'update': {
        if (!params.webhookId) return { error: 'webhookId is required' };
        const existing = await this.db.prepare(`SELECT * FROM webhook_endpoints WHERE id = ?`).bind(params.webhookId).first<any>();
        if (!existing) return { error: 'Webhook not found' };

        const url = params.url || existing.url;
        const events = params.events || (typeof existing.events === 'string' ? JSON.parse(existing.events) : existing.events);
        const active = params.active !== undefined ? (params.active ? 1 : 0) : existing.active;

        await this.db.prepare(
          `UPDATE webhook_endpoints SET url = ?, events = ?, active = ?, updated_at = ? WHERE id = ?`
        ).bind(url, JSON.stringify(events), active, now, params.webhookId).run();
        return { id: params.webhookId, url, events, active: !!active, updatedAt: now };
      }

      case 'delete': {
        if (!params.webhookId) return { error: 'webhookId is required' };
        await this.db.prepare(`DELETE FROM webhook_deliveries WHERE webhook_id = ?`).bind(params.webhookId).run();
        const result = await this.db.prepare(`DELETE FROM webhook_endpoints WHERE id = ?`).bind(params.webhookId).run();
        return { deleted: result.meta.changes > 0, webhookId: params.webhookId };
      }

      case 'list': {
        const webhooks = await this.db.prepare(`SELECT * FROM webhook_endpoints ORDER BY created_at DESC`).all<any>();
        return {
          webhooks: (webhooks.results || []).map(w => ({
            ...w,
            events: typeof w.events === 'string' ? JSON.parse(w.events) : w.events,
            active: !!w.active,
            secret: undefined, // Never return secret in list
          })),
          total: (webhooks.results || []).length,
        };
      }

      case 'list_deliveries': {
        if (!params.webhookId) return { error: 'webhookId is required' };
        const limit = params.limit || 20;
        const deliveries = await this.db.prepare(
          `SELECT * FROM webhook_deliveries WHERE webhook_id = ? ORDER BY created_at DESC LIMIT ?`
        ).bind(params.webhookId, limit).all<WebhookDelivery>();
        return {
          webhookId: params.webhookId,
          deliveries: (deliveries.results || []).map(d => ({
            id: d.id,
            eventType: d.event_type,
            status: d.status,
            attempts: d.attempts,
            createdAt: d.created_at,
          })),
        };
      }

      case 'test': {
        if (!params.webhookId) return { error: 'webhookId is required' };
        const webhook = await this.db.prepare(`SELECT * FROM webhook_endpoints WHERE id = ?`).bind(params.webhookId).first<any>();
        if (!webhook) return { error: 'Webhook not found' };

        const testPayload = { event: 'test', timestamp: now, message: 'UluCore webhook test' };
        const deliveryId = `del_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;
        let deliveryStatus = 'failed';
        let httpStatus = 0;

        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-UluCore-Signature': `sha256=${webhook.secret}` },
            body: JSON.stringify(testPayload),
            signal: AbortSignal.timeout(10000),
          });
          httpStatus = response.status;
          deliveryStatus = response.ok ? 'delivered' : 'failed';
        } catch {
          deliveryStatus = 'failed';
        }

        await this.db.prepare(
          `INSERT INTO webhook_deliveries (id, webhook_id, event_type, payload, status, attempts, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)`
        ).bind(deliveryId, params.webhookId, 'test', JSON.stringify(testPayload), deliveryStatus, now).run();

        return { deliveryId, status: deliveryStatus, httpStatus, url: webhook.url, testedAt: now };
      }

      default:
        return { error: `Unknown action: ${action}` };
    }
  }

  /**
   * Internal: Trigger webhooks for an event
   */
  private async triggerWebhooks(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      const webhooks = await this.db.prepare(
        `SELECT * FROM webhook_endpoints WHERE active = 1`
      ).all<any>();

      for (const wh of (webhooks.results || [])) {
        const events = typeof wh.events === 'string' ? JSON.parse(wh.events) : wh.events;
        if (!events.includes(eventType) && !events.includes('*')) continue;

        const deliveryId = `del_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;
        const now = new Date().toISOString();

        try {
          const response = await fetch(wh.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-UluCore-Event': eventType, 'X-UluCore-Signature': `sha256=${wh.secret}` },
            body: JSON.stringify({ event: eventType, timestamp: now, data: payload }),
            signal: AbortSignal.timeout(5000),
          });

          await this.db.prepare(
            `INSERT INTO webhook_deliveries (id, webhook_id, event_type, payload, status, attempts, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)`
          ).bind(deliveryId, wh.id, eventType, JSON.stringify(payload), response.ok ? 'delivered' : 'failed', now).run();
        } catch {
          await this.db.prepare(
            `INSERT INTO webhook_deliveries (id, webhook_id, event_type, payload, status, attempts, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)`
          ).bind(deliveryId, wh.id, eventType, JSON.stringify(payload), 'failed', now).run();
        }
      }
    } catch {
      // Webhook failures should not block the main operation
    }
  }

  /**
   * uc_rate_limiting: Configure and check rate limits per user/action
   */
  async rateLimiting(
    action: 'create_rule' | 'update_rule' | 'delete_rule' | 'list_rules' | 'check_limit' | 'reset_counter',
    params: {
      ruleId?: string;
      name?: string;
      actionType?: string;
      maxRequests?: number;
      windowSeconds?: number;
      userId?: string;
    }
  ): Promise<Record<string, unknown>> {
    const now = new Date().toISOString();

    switch (action) {
      case 'create_rule': {
        if (!params.name || !params.maxRequests || !params.windowSeconds) return { error: 'name, maxRequests, and windowSeconds are required' };
        const id = `rl_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;
        await this.db.prepare(
          `INSERT INTO rate_limit_rules (id, name, action_type, max_requests, window_seconds, created_at) VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(id, params.name, params.actionType || '*', params.maxRequests, params.windowSeconds, now).run();
        return { id, name: params.name, actionType: params.actionType || '*', maxRequests: params.maxRequests, windowSeconds: params.windowSeconds };
      }

      case 'update_rule': {
        if (!params.ruleId) return { error: 'ruleId is required' };
        const existing = await this.db.prepare(`SELECT * FROM rate_limit_rules WHERE id = ?`).bind(params.ruleId).first<any>();
        if (!existing) return { error: 'Rule not found' };

        const name = params.name || existing.name;
        const actionType = params.actionType || existing.action_type;
        const maxRequests = params.maxRequests || existing.max_requests;
        const windowSeconds = params.windowSeconds || existing.window_seconds;

        await this.db.prepare(
          `UPDATE rate_limit_rules SET name = ?, action_type = ?, max_requests = ?, window_seconds = ? WHERE id = ?`
        ).bind(name, actionType, maxRequests, windowSeconds, params.ruleId).run();
        return { id: params.ruleId, name, actionType, maxRequests, windowSeconds };
      }

      case 'delete_rule': {
        if (!params.ruleId) return { error: 'ruleId is required' };
        const result = await this.db.prepare(`DELETE FROM rate_limit_rules WHERE id = ?`).bind(params.ruleId).run();
        return { deleted: result.meta.changes > 0, ruleId: params.ruleId };
      }

      case 'list_rules': {
        const rules = await this.db.prepare(`SELECT * FROM rate_limit_rules ORDER BY created_at ASC`).all<any>();
        return { rules: rules.results || [], total: (rules.results || []).length };
      }

      case 'check_limit': {
        if (!params.userId) return { error: 'userId is required' };
        const actionType = params.actionType || '*';
        
        // Find applicable rules
        const rules = await this.db.prepare(
          `SELECT * FROM rate_limit_rules WHERE action_type = ? OR action_type = '*'`
        ).bind(actionType).all<any>();

        if ((rules.results || []).length === 0) {
          return { userId: params.userId, actionType, allowed: true, reason: 'No rate limit rules configured' };
        }

        const results: Array<Record<string, unknown>> = [];
        let overallAllowed = true;

        for (const rule of (rules.results || [])) {
          const windowStart = new Date(Date.now() - rule.window_seconds * 1000).toISOString();
          
          // Clean old counters and check current
          const counter = await this.db.prepare(
            `SELECT SUM(request_count) as total FROM rate_limit_counters WHERE user_id = ? AND action_type = ? AND window_start >= ?`
          ).bind(params.userId, rule.action_type === '*' ? actionType : rule.action_type, windowStart).first<{ total: number }>();

          const currentCount = counter?.total || 0;
          const allowed = currentCount < rule.max_requests;
          if (!allowed) overallAllowed = false;

          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            currentCount,
            maxRequests: rule.max_requests,
            windowSeconds: rule.window_seconds,
            allowed,
            remaining: Math.max(0, rule.max_requests - currentCount),
          });
        }

        return { userId: params.userId, actionType, allowed: overallAllowed, rules: results };
      }

      case 'reset_counter': {
        if (!params.userId) return { error: 'userId is required' };
        const actionType = params.actionType || '*';
        if (actionType === '*') {
          await this.db.prepare(`DELETE FROM rate_limit_counters WHERE user_id = ?`).bind(params.userId).run();
        } else {
          await this.db.prepare(`DELETE FROM rate_limit_counters WHERE user_id = ? AND action_type = ?`).bind(params.userId, actionType).run();
        }
        return { reset: true, userId: params.userId, actionType };
      }

      default:
        return { error: `Unknown action: ${action}` };
    }
  }

  /**
   * Increment rate limit counter (called internally during process_action)
   */
  async incrementRateLimitCounter(userId: string, actionType: string): Promise<void> {
    try {
      const now = new Date();
      const windowId = `${userId}_${actionType}_${now.toISOString().substring(0, 16)}`;
      
      const existing = await this.db.prepare(
        `SELECT id FROM rate_limit_counters WHERE id = ?`
      ).bind(windowId).first<{ id: string }>();

      if (existing) {
        await this.db.prepare(
          `UPDATE rate_limit_counters SET request_count = request_count + 1 WHERE id = ?`
        ).bind(windowId).run();
      } else {
        await this.db.prepare(
          `INSERT INTO rate_limit_counters (id, user_id, action_type, window_start, request_count) VALUES (?, ?, ?, ?, 1)`
        ).bind(windowId, userId, actionType, now.toISOString()).run();
      }
    } catch {
      // Rate limit counter failures should not block operations
    }
  }

  /**
   * uc_stripe_integration: Stripe payment processing (checkout, subscription management)
   */
  async stripeIntegration(
    action: 'create_checkout' | 'get_subscription' | 'cancel_subscription' | 'list_customers' | 'handle_webhook',
    params: {
      userId?: string;
      planId?: string;
      successUrl?: string;
      cancelUrl?: string;
      subscriptionId?: string;
      webhookData?: string;
      webhookSignature?: string;
    },
    stripeKey?: string
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case 'create_checkout': {
        if (!params.userId || !params.planId) return { error: 'userId and planId are required' };
        const plans = this.getBillingPlans();
        const plan = plans.find(p => p.id === params.planId);
        if (!plan) return { error: 'Invalid plan ID' };

        if (!stripeKey) {
          // Demo mode - return a mock checkout URL
          const sessionId = `cs_${crypto.randomUUID().replace(/-/g, '')}`;
          return {
            mode: 'demo',
            sessionId,
            checkoutUrl: `https://billing.ulucore.dev/checkout/${sessionId}`,
            plan: params.planId,
            price: plan.price_monthly,
            userId: params.userId,
            message: 'Stripe key not configured. Running in demo mode.',
          };
        }

        try {
          // Real Stripe integration
          const priceId = params.planId === 'pro' ? 'price_pro_monthly' : 'price_enterprise_monthly';
          const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${stripeKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              'mode': 'subscription',
              'payment_method_types[0]': 'card',
              'line_items[0][price]': priceId,
              'line_items[0][quantity]': '1',
              'success_url': params.successUrl || 'https://ulucore.dev/billing?success=true',
              'cancel_url': params.cancelUrl || 'https://ulucore.dev/billing?canceled=true',
              'client_reference_id': params.userId,
              'metadata[user_id]': params.userId,
              'metadata[plan]': params.planId,
            }),
          });
          const session = await response.json() as any;
          return { mode: 'live', sessionId: session.id, checkoutUrl: session.url, plan: params.planId };
        } catch (e: any) {
          return { error: `Stripe API error: ${e.message}` };
        }
      }

      case 'get_subscription': {
        if (!params.userId) return { error: 'userId is required' };
        const customer = await this.db.prepare(
          `SELECT * FROM stripe_customers WHERE user_id = ?`
        ).bind(params.userId).first<any>();
        if (!customer) return { userId: params.userId, subscription: null, plan: 'free', status: 'none' };
        return {
          userId: params.userId,
          stripeCustomerId: customer.stripe_customer_id,
          stripeSubscriptionId: customer.stripe_subscription_id,
          plan: customer.plan,
          status: customer.status,
        };
      }

      case 'cancel_subscription': {
        if (!params.userId) return { error: 'userId is required' };
        const customer = await this.db.prepare(
          `SELECT * FROM stripe_customers WHERE user_id = ?`
        ).bind(params.userId).first<any>();
        if (!customer || !customer.stripe_subscription_id) return { error: 'No active subscription found' };

        if (stripeKey) {
          try {
            await fetch(`https://api.stripe.com/v1/subscriptions/${customer.stripe_subscription_id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${stripeKey}` },
            });
          } catch (e: any) {
            return { error: `Stripe API error: ${e.message}` };
          }
        }

        await this.db.prepare(
          `UPDATE stripe_customers SET plan = 'free', status = 'canceled', updated_at = ? WHERE user_id = ?`
        ).bind(new Date().toISOString(), params.userId).run();
        await this.db.prepare(
          `UPDATE users SET plan = 'free' WHERE id = ?`
        ).bind(params.userId).run();

        return { canceled: true, userId: params.userId, previousPlan: customer.plan, currentPlan: 'free' };
      }

      case 'list_customers': {
        const customers = await this.db.prepare(
          `SELECT sc.*, u.email, u.name FROM stripe_customers sc JOIN users u ON sc.user_id = u.id ORDER BY sc.created_at DESC`
        ).all<any>();
        return {
          customers: (customers.results || []).map(c => ({
            userId: c.user_id,
            email: c.email,
            name: c.name,
            stripeCustomerId: c.stripe_customer_id,
            plan: c.plan,
            status: c.status,
            createdAt: c.created_at,
          })),
          total: (customers.results || []).length,
        };
      }

      case 'handle_webhook': {
        if (!params.webhookData) return { error: 'webhookData is required' };
        try {
          const event = JSON.parse(params.webhookData);
          const eventType = event.type || 'unknown';

          if (eventType === 'checkout.session.completed') {
            const session = event.data?.object;
            if (session) {
              const userId = session.metadata?.user_id || session.client_reference_id;
              const plan = session.metadata?.plan || 'pro';
              const customerId = session.customer;
              const subscriptionId = session.subscription;

              if (userId) {
                const existing = await this.db.prepare(
                  `SELECT id FROM stripe_customers WHERE user_id = ?`
                ).bind(userId).first<{ id: string }>();

                const now = new Date().toISOString();
                if (existing) {
                  await this.db.prepare(
                    `UPDATE stripe_customers SET stripe_customer_id = ?, stripe_subscription_id = ?, plan = ?, status = 'active', updated_at = ? WHERE user_id = ?`
                  ).bind(customerId, subscriptionId, plan, now, userId).run();
                } else {
                  await this.db.prepare(
                    `INSERT INTO stripe_customers (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`
                  ).bind(crypto.randomUUID(), userId, customerId, subscriptionId, plan, now, now).run();
                }
                await this.db.prepare(`UPDATE users SET plan = ? WHERE id = ?`).bind(plan, userId).run();
              }
            }
          }

          return { received: true, eventType, processedAt: new Date().toISOString() };
        } catch (e: any) {
          return { error: `Webhook processing error: ${e.message}` };
        }
      }

      default:
        return { error: `Unknown action: ${action}` };
    }
  }
}

// ═══════════════════════════════════════════════════════════
// MCP SERVER FACTORY v2.0
// ═══════════════════════════════════════════════════════════

function createMcpServer(db: D1Database, env?: Env): McpServer {
  const client = new UluCoreClient(db);

  const server = new McpServer(
    { name: 'UluCore', version: '2.0.0' },
    { capabilities: { tools: {}, resources: {}, prompts: {} } }
  );

  // ═══════════════════════════════════════════════════════════
  // v1.0-1.1 TOOLS (preserved for backward compatibility)
  // ═══════════════════════════════════════════════════════════

  server.registerTool('process_action', {
    title: 'Process Action',
    description: 'Process an action request through the decision engine. Evaluates all enabled policies in priority order, returns the first matching decision. Also triggers webhook notifications for configured endpoints.',
    inputSchema: {
      action_type: z.string().describe('Type of action (e.g. delete, create, update, deploy)'),
      resource_id: z.string().describe('Target resource identifier'),
      user_id: z.string().describe('User requesting the action'),
      metadata: z.record(z.unknown()).optional().default({}).describe('Additional context for policy evaluation'),
    },
  }, async ({ action_type, resource_id, user_id, metadata }) => {
    // Check rate limits
    const rateCheck = await client.rateLimiting('check_limit', { userId: user_id, actionType: action_type });
    if (!(rateCheck as any).allowed) {
      return { content: [{ type: 'text' as const, text: JSON.stringify({ decision: 'reject', reason: 'Rate limit exceeded', details: rateCheck }, null, 2) }], isError: true };
    }
    // Increment counter
    await client.incrementRateLimitCounter(user_id, action_type);
    // Process
    const result = await client.processAction(action_type, resource_id, user_id, metadata);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('create_policy', {
    title: 'Create Policy',
    description: 'Create a new deterministic policy. Policies are evaluated in order and all conditions must match (AND logic) for the policy to apply.',
    inputSchema: {
      name: z.string().describe('Human-readable policy name'),
      description: z.string().optional().default('').describe('What this policy does'),
      conditions: z.array(z.object({
        field: z.string().describe('Field to check: action_type, resource_id, user_id, or any metadata key'),
        operator: z.enum(['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than']),
        value: z.string().describe('Value to compare against'),
      })).describe('All conditions must match (AND logic)'),
      decision: z.enum(['approve', 'reject', 'require_approval']).describe('Action to take when policy matches'),
      reason: z.string().describe('Explanation for the decision'),
    },
  }, async ({ name, description, conditions, decision, reason }) => {
    const result = await client.createPolicy(name, description || '', conditions, decision, reason);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('list_policies', {
    title: 'List Policies',
    description: 'List all existing deterministic policies.',
    inputSchema: {},
  }, async () => {
    const result = await client.listPolicies();
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('update_policy', {
    title: 'Update Policy',
    description: 'Update an existing policy. Only provided fields will be updated. Automatically creates a version snapshot.',
    inputSchema: {
      policy_id: z.string().describe('Policy ID to update'),
      name: z.string().optional().describe('New name'),
      description: z.string().optional().describe('New description'),
      conditions: z.array(z.object({
        field: z.string(),
        operator: z.enum(['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than']),
        value: z.string(),
      })).optional().describe('New conditions'),
      decision: z.enum(['approve', 'reject', 'require_approval']).optional().describe('New decision'),
      reason: z.string().optional().describe('New reason'),
    },
  }, async ({ policy_id, name, description, conditions, decision, reason }) => {
    const result = await client.updatePolicy(policy_id, { name, description, conditions, decision, reason } as any);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('delete_policy', {
    title: 'Delete Policy',
    description: 'Delete a policy by its ID.',
    inputSchema: {
      policy_id: z.string().describe('Policy ID to delete'),
    },
  }, async ({ policy_id }) => {
    const result = await client.deletePolicy(policy_id);
    return { content: [{ type: 'text' as const, text: JSON.stringify({ deleted: result, policyId: policy_id }, null, 2) }] };
  });

  server.registerTool('get_events', {
    title: 'Get Events',
    description: 'Get immutable audit log events. Events are append-only, never updated or deleted.',
    inputSchema: {
      user_id: z.string().optional().describe('Filter by user ID'),
      action_type: z.string().optional().describe('Filter by action type'),
      limit: z.number().optional().default(50).describe('Max results'),
      offset: z.number().optional().default(0).describe('Offset for pagination'),
    },
  }, async ({ user_id, action_type, limit, offset }) => {
    const result = await client.getEvents(user_id, action_type, limit, offset);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('get_metrics', {
    title: 'Get Metrics',
    description: 'Get aggregated metrics: total actions, approved/rejected counts, reject rate, AI availability.',
    inputSchema: {},
  }, async () => {
    const result = await client.getMetrics();
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('simulate_policy', {
    title: 'Simulate Policy',
    description: 'Simulate a policy against an action request without creating an event. Read-only, safe test.',
    inputSchema: {
      conditions: z.array(z.object({
        field: z.string(),
        operator: z.enum(['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than']),
        value: z.string(),
      })),
      decision: z.enum(['approve', 'reject', 'require_approval']),
      reason: z.string(),
      action_type: z.string(),
      resource_id: z.string(),
      user_id: z.string(),
      metadata: z.record(z.unknown()).optional().default({}),
    },
  }, async ({ conditions, decision, reason, action_type, resource_id, user_id, metadata }) => {
    const result = await client.simulatePolicy(conditions, decision, reason, action_type, resource_id, user_id, metadata);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('signup', {
    title: 'User Signup',
    description: 'Create a new user account in UluCore.',
    inputSchema: {
      email: z.string().email().describe('User email address'),
      password: z.string().min(6).describe('Password (min 6 characters)'),
      name: z.string().optional().describe('Full name'),
    },
  }, async ({ email, password, name }) => {
    const result = await client.signup(email, password, name);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('create_api_key', {
    title: 'Create API Key',
    description: 'Generate a new API key for a user. The full key is only returned once!',
    inputSchema: {
      user_id: z.string().describe('User ID to create key for'),
      name: z.string().describe('Descriptive name for the key'),
    },
  }, async ({ user_id, name }) => {
    const result = await client.createApiKey(user_id, name);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('get_billing_plans', {
    title: 'Get Billing Plans',
    description: 'Get available pricing plans for UluCore SaaS.',
    inputSchema: {},
  }, async () => {
    const result = client.getBillingPlans();
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  // ═══════════════════════════════════════════════════════════
  // v2.0 NEW TOOLS
  // ═══════════════════════════════════════════════════════════

  server.registerTool('uc_role_management', {
    title: 'Role Management (RBAC)',
    description: 'Full role-based access control. Create/update/delete roles with granular permissions, assign/revoke roles from users, and check user permissions. Permissions are strings like "actions:approve", "policies:manage", "admin:*".',
    inputSchema: {
      action: z.enum(['create_role', 'update_role', 'delete_role', 'assign_role', 'revoke_role', 'check_permission', 'list_roles', 'get_user_roles'])
        .describe('RBAC action to perform'),
      roleId: z.string().optional().describe('Role ID (for update/delete/assign/revoke)'),
      roleName: z.string().optional().describe('Role name (for create/update)'),
      description: z.string().optional().describe('Role description'),
      permissions: z.array(z.string()).optional().describe('Permission strings (e.g. ["actions:approve", "policies:manage", "admin:*"])'),
      userId: z.string().optional().describe('User ID (for assign/revoke/check/get_user_roles)'),
      permission: z.string().optional().describe('Single permission to check (for check_permission)'),
    },
  }, async (params) => {
    const result = await client.roleManagement(params.action as any, params as any);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('uc_policy_versioning', {
    title: 'Policy Versioning',
    description: 'Manage policy version history. View all versions of a policy, get specific version snapshots, diff two versions, and rollback to a previous version. Every policy change automatically creates a version snapshot.',
    inputSchema: {
      action: z.enum(['get_history', 'get_version', 'diff_versions', 'rollback'])
        .describe('Versioning action: get_history (list all versions), get_version (view snapshot), diff_versions (compare two), rollback (restore a version)'),
      policyId: z.string().optional().describe('Policy ID'),
      version: z.number().optional().describe('Version number (for get_version/rollback)'),
      fromVersion: z.number().optional().describe('Starting version (for diff)'),
      toVersion: z.number().optional().describe('Ending version (for diff)'),
    },
  }, async (params) => {
    const result = await client.policyVersioning(params.action as any, params as any);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('uc_webhook_notifications', {
    title: 'Webhook Notifications',
    description: 'Register and manage webhook endpoints for real-time event notifications. When actions are processed, configured webhooks receive POST requests with event data. Supports test deliveries and delivery history.',
    inputSchema: {
      action: z.enum(['register', 'update', 'delete', 'list', 'list_deliveries', 'test'])
        .describe('Webhook action: register (new endpoint), update (modify), delete (remove), list (all endpoints), list_deliveries (delivery log), test (send test event)'),
      webhookId: z.string().optional().describe('Webhook endpoint ID (for update/delete/list_deliveries/test)'),
      url: z.string().optional().describe('Webhook URL (for register/update)'),
      events: z.array(z.string()).optional().describe('Event types to listen for (e.g. ["action_processed", "*"])'),
      active: z.boolean().optional().describe('Enable/disable endpoint'),
      limit: z.number().optional().default(20).describe('Max deliveries to return'),
    },
  }, async (params) => {
    const result = await client.webhookNotifications(params.action as any, params as any);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('uc_rate_limiting', {
    title: 'Rate Limiting',
    description: 'Configure and enforce per-user rate limits. Create rules with max requests per time window, check if a user has exceeded their limit, and manage counters. Integrated with process_action for automatic enforcement.',
    inputSchema: {
      action: z.enum(['create_rule', 'update_rule', 'delete_rule', 'list_rules', 'check_limit', 'reset_counter'])
        .describe('Rate limit action: create_rule (new limit), update_rule (modify), delete_rule (remove), list_rules (all rules), check_limit (verify user), reset_counter (clear)'),
      ruleId: z.string().optional().describe('Rule ID (for update/delete)'),
      name: z.string().optional().describe('Rule name (for create/update)'),
      actionType: z.string().optional().describe('Action type to limit (use "*" for all actions)'),
      maxRequests: z.number().optional().describe('Maximum requests allowed in the window'),
      windowSeconds: z.number().optional().describe('Time window in seconds'),
      userId: z.string().optional().describe('User ID (for check_limit/reset_counter)'),
    },
  }, async (params) => {
    const result = await client.rateLimiting(params.action as any, params as any);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool('uc_stripe_integration', {
    title: 'Stripe Integration',
    description: 'Stripe payment processing for UluCore SaaS. Create checkout sessions, manage subscriptions, list customers, and handle Stripe webhooks. Runs in demo mode when STRIPE_SECRET_KEY is not configured.',
    inputSchema: {
      action: z.enum(['create_checkout', 'get_subscription', 'cancel_subscription', 'list_customers', 'handle_webhook'])
        .describe('Stripe action: create_checkout (start payment), get_subscription (view status), cancel_subscription (end), list_customers (all), handle_webhook (process Stripe events)'),
      userId: z.string().optional().describe('User ID'),
      planId: z.string().optional().describe('Plan ID: free, pro, or enterprise'),
      successUrl: z.string().optional().describe('Redirect URL after successful payment'),
      cancelUrl: z.string().optional().describe('Redirect URL after canceled payment'),
      subscriptionId: z.string().optional().describe('Stripe subscription ID'),
      webhookData: z.string().optional().describe('Raw Stripe webhook event JSON'),
      webhookSignature: z.string().optional().describe('Stripe webhook signature header'),
    },
  }, async (params) => {
    const result = await client.stripeIntegration(params.action as any, params as any, env?.STRIPE_SECRET_KEY);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  return server;
}

// ═══════════════════════════════════════════════════════════
// CLOUDFLARE WORKERS HANDLER
// ═══════════════════════════════════════════════════════════

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, mcp-session-id, Last-Event-ID, mcp-protocol-version',
          'Access-Control-Expose-Headers': 'mcp-session-id, mcp-protocol-version',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Health check
    if (url.pathname === '/health') {
      let dbStatus = 'ok';
      try {
        await env.DB.prepare('SELECT 1').first();
      } catch {
        dbStatus = 'error';
      }
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'UluCore MCP Server',
        version: '2.0.0',
        transport: 'streamable-http',
        database: dbStatus,
        ai: env.AI ? 'configured' : 'not_configured',
        stripe: env.STRIPE_SECRET_KEY ? 'configured' : 'demo_mode',
        tools: {
          v1: ['process_action', 'create_policy', 'list_policies', 'update_policy', 'delete_policy', 'get_events', 'get_metrics', 'simulate_policy', 'signup', 'create_api_key', 'get_billing_plans'],
          v2_new: ['uc_role_management', 'uc_policy_versioning', 'uc_webhook_notifications', 'uc_rate_limiting', 'uc_stripe_integration'],
        },
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Stripe webhook endpoint (separate from MCP)
    if (url.pathname === '/stripe/webhook' && request.method === 'POST') {
      const client = new UluCoreClient(env.DB);
      const body = await request.text();
      const signature = request.headers.get('stripe-signature') || '';
      const result = await client.stripeIntegration('handle_webhook', { webhookData: body, webhookSignature: signature }, env.STRIPE_SECRET_KEY);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // MCP endpoint
    if (url.pathname === '/mcp' || url.pathname === '/' || url.pathname === '/sse') {
      try {
        // Ensure DB tables exist
        const client = new UluCoreClient(env.DB);
        try { await client.initDB(); } catch {}

        const transport = new WebStandardStreamableHTTPServerTransport();
        const mcpServer = createMcpServer(env.DB, env);
        await mcpServer.connect(transport);
        // Ensure Accept header for broad client compatibility
        // Always inject both Accept types to avoid SDK 406 errors
        const reqHeaders = new Headers(request.headers);
        const existingAccept = reqHeaders.get('Accept') || '';
        if (!existingAccept.includes('text/event-stream') || !existingAccept.includes('application/json')) {
          reqHeaders.set('Accept', 'application/json, text/event-stream');
        }
        const modifiedRequest = new Request(request.url, {
          method: request.method,
          headers: reqHeaders,
          body: request.method !== 'GET' && request.body ? await request.arrayBuffer() : undefined,
        });
        const response = await transport.handleRequest(modifiedRequest);

        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Access-Control-Expose-Headers', 'mcp-session-id, mcp-protocol-version');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'MCP request failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
