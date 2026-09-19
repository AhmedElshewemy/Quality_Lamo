/**
 * Database Schema Definition
 * 
 * Defines the structure of all tables in the database.
 * This is the single source of truth for the database schema.
 */

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  indexes?: IndexDefinition[];
}

export interface ColumnDefinition {
  name: string;
  type: string;
  constraints?: string;
  defaultValue?: string;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
}

export const SCHEMA_VERSION = 1;

export const TABLES: TableSchema[] = [
  {
    name: 'branches',
    columns: [
      { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY' },
      { name: 'name', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'location', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'type', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'created_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
    indexes: [
      { name: 'idx_branches_type', columns: ['type'] },
    ],
  },
  {
    name: 'users',
    columns: [
      { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY' },
      { name: 'name', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'email', type: 'TEXT', constraints: 'NOT NULL UNIQUE' },
      { name: 'password_hash', type: 'TEXT' },
      { name: 'role', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'branch_id', type: 'TEXT', constraints: 'REFERENCES branches(id)' },
      { name: 'created_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
    indexes: [
      { name: 'idx_users_email', columns: ['email'], unique: true },
      { name: 'idx_users_role', columns: ['role'] },
      { name: 'idx_users_branch', columns: ['branch_id'] },
    ],
  },
  {
    name: 'issues',
    columns: [
      { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY' },
      { name: 'title', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'description', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'branch_id', type: 'TEXT', constraints: 'NOT NULL REFERENCES branches(id)' },
      { name: 'category', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'priority', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'status', type: 'TEXT', constraints: 'NOT NULL DEFAULT \'open\'' },
      { name: 'compliance_status', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'images', type: 'TEXT', defaultValue: '[]' }, // JSON array
      { name: 'reported_by', type: 'TEXT', constraints: 'NOT NULL REFERENCES users(id)' },
      { name: 'reported_at', type: 'DATETIME', constraints: 'NOT NULL' },
      { name: 'resolved_at', type: 'DATETIME' },
      { name: 'resolution_notes', type: 'TEXT' },
      { name: 'assigned_to', type: 'TEXT', constraints: 'REFERENCES users(id)' },
      { name: 'follow_up_date', type: 'DATETIME' },
      { name: 'created_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
    indexes: [
      { name: 'idx_issues_branch', columns: ['branch_id'] },
      { name: 'idx_issues_status', columns: ['status'] },
      { name: 'idx_issues_priority', columns: ['priority'] },
      { name: 'idx_issues_category', columns: ['category'] },
      { name: 'idx_issues_reported_by', columns: ['reported_by'] },
      { name: 'idx_issues_reported_at', columns: ['reported_at'] },
      { name: 'idx_issues_compliance', columns: ['compliance_status'] },
    ],
  },
  {
    name: 'issue_images',
    columns: [
      { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY' },
      { name: 'issue_id', type: 'TEXT', constraints: 'NOT NULL REFERENCES issues(id) ON DELETE CASCADE' },
      { name: 'image_url', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'caption', type: 'TEXT' },
      { name: 'uploaded_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
    indexes: [
      { name: 'idx_issue_images_issue', columns: ['issue_id'] },
    ],
  },
  {
    name: 'inspections',
    columns: [
      { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY' },
      { name: 'branch_id', type: 'TEXT', constraints: 'NOT NULL REFERENCES branches(id)' },
      { name: 'inspector_id', type: 'TEXT', constraints: 'NOT NULL REFERENCES users(id)' },
      { name: 'inspection_date', type: 'DATETIME', constraints: 'NOT NULL' },
      { name: 'category', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'compliance_status', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'score', type: 'INTEGER', constraints: 'NOT NULL' },
      { name: 'notes', type: 'TEXT' },
      { name: 'created_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
    indexes: [
      { name: 'idx_inspections_branch', columns: ['branch_id'] },
      { name: 'idx_inspections_date', columns: ['inspection_date'] },
      { name: 'idx_inspections_inspector', columns: ['inspector_id'] },
    ],
  },
  {
    name: 'audit_log',
    columns: [
      { name: 'id', type: 'INTEGER', constraints: 'PRIMARY KEY AUTOINCREMENT' },
      { name: 'entity_type', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'entity_id', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'action', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'user_id', type: 'TEXT', constraints: 'REFERENCES users(id)' },
      { name: 'old_values', type: 'TEXT' }, // JSON
      { name: 'new_values', type: 'TEXT' }, // JSON
      { name: 'created_at', type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
    indexes: [
      { name: 'idx_audit_entity', columns: ['entity_type', 'entity_id'] },
      { name: 'idx_audit_user', columns: ['user_id'] },
      { name: 'idx_audit_created', columns: ['created_at'] },
    ],
  },
];
