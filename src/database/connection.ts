/**
 * Database Connection Manager
 * 
 * Manages the SQLite database connection using sql.js (WebAssembly).
 * Handles initialization, migrations, and connection lifecycle.
 */

import initSqlJs, { Database } from 'sql.js';
import { TABLES, SCHEMA_VERSION } from './schema';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database | null = null;
  private isInitialized = false;
  private readonly DB_STORAGE_KEY = 'seafood_qms_db';
  private readonly SCHEMA_VERSION_KEY = 'seafood_qms_schema_version';

  private constructor() {}

  /**
   * Get singleton instance of DatabaseManager
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize the database connection
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize sql.js
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem(this.DB_STORAGE_KEY);
      
      if (savedDb) {
        const buf = new Uint8Array(JSON.parse(savedDb)).buffer;
        this.db = new SQL.Database(buf);
      } else {
        this.db = new SQL.Database();
      }

      // Run migrations
      await this.runMigrations();

      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const currentVersion = this.getSchemaVersion();
    
    if (currentVersion < SCHEMA_VERSION) {
      console.log(`🔄 Migrating database from version ${currentVersion} to ${SCHEMA_VERSION}`);
      
      // Create tables
      for (const table of TABLES) {
        const createTableSQL = this.generateCreateTableSQL(table);
        this.db.run(createTableSQL);
      }

      // Create indexes
      for (const table of TABLES) {
        if (table.indexes) {
          for (const index of table.indexes) {
            const createIndexSQL = this.generateCreateIndexSQL(table.name, index);
            this.db.run(createIndexSQL);
          }
        }
      }

      // Seed initial data if first time
      if (currentVersion === 0) {
        await this.seedInitialData();
      }

      // Update schema version
      this.setSchemaVersion(SCHEMA_VERSION);
      this.save();
    }
  }

  /**
   * Generate CREATE TABLE SQL statement
   */
  private generateCreateTableSQL(table: typeof TABLES[0]): string {
    const columns = table.columns.map(col => {
      let sql = `${col.name} ${col.type}`;
      if (col.constraints) sql += ` ${col.constraints}`;
      if (col.defaultValue) sql += ` DEFAULT ${col.defaultValue}`;
      return sql;
    });

    return `CREATE TABLE IF NOT EXISTS ${table.name} (${columns.join(', ')})`;
  }

  /**
   * Generate CREATE INDEX SQL statement
   */
  private generateCreateIndexSQL(tableName: string, index: { name: string; columns: string[]; unique?: boolean }): string {
    const unique = index.unique ? 'UNIQUE' : '';
    return `CREATE ${unique} INDEX IF NOT EXISTS ${index.name} ON ${tableName} (${index.columns.join(', ')})`;
  }

  /**
   * Seed initial data (branches, users, sample issues)
   */
  private async seedInitialData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Seed branches
    const branches = [
      ['branch-1', 'فرع المعادي', 'المعادي، القاهرة', 'branch'],
      ['branch-2', 'فرع مدينة نصر', 'مدينة نصر، القاهرة', 'branch'],
      ['branch-3', 'فرع التجمع الخامس', 'التجمع الخامس، القاهرة الجديدة', 'branch'],
      ['headquarters', 'الإدارة الرئيسية', 'المهندسين، الجيزة', 'headquarters'],
      ['central-kitchen', 'المطبخ المركزي', 'العاشر من رمضان', 'central_kitchen'],
      ['main-warehouse', 'المخزن الرئيسي', 'العبور، القاهرة', 'main_warehouse'],
    ];

    for (const branch of branches) {
      this.db.run(
        'INSERT INTO branches (id, name, location, type) VALUES (?, ?, ?, ?)',
        branch
      );
    }

    // Seed users
    const users = [
      ['user-1', 'أحمد محمد', 'ahmed@seafood.com', null, 'quality_engineer', 'branch-1'],
      ['user-2', 'محمود علي', 'mahmoud@seafood.com', null, 'quality_engineer', 'branch-2'],
      ['user-3', 'خالد حسن', 'khaled@seafood.com', null, 'quality_engineer', 'branch-3'],
      ['manager-1', 'د. سارة أحمد', 'sara@seafood.com', null, 'quality_manager', null],
      ['admin-1', 'مدير النظام', 'admin@seafood.com', null, 'admin', null],
    ];

    for (const user of users) {
      this.db.run(
        'INSERT INTO users (id, name, email, password_hash, role, branch_id) VALUES (?, ?, ?, ?, ?, ?)',
        user
      );
    }

    // Seed sample issues
    const now = new Date();
    const daysAgo = (d: number) => {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      return date.toISOString();
    };

    const issues = [
      ['issue-1', 'ارتفاع درجة حرارة الثلاجة الرئيسية', 'تم رصد ارتفاع في درجة حرارة الثلاجة الرئيسية عن المعدل المطلوب', 'branch-1', 'temperature', 'critical', 'resolved', 'non_compliant', '[]', 'user-1', daysAgo(2), daysAgo(1), 'تم إصلاح الثلاجة وضبط الحرارة', null, null],
      ['issue-2', 'عدم ارتداء قفازات أثناء تحضير الطعام', 'لاحظ عدم ارتداء بعض العاملين للقفازات', 'branch-2', 'hygiene', 'high', 'in_progress', 'partially_compliant', '[]', 'user-2', daysAgo(5), null, null, 'user-2', null],
      ['issue-3', 'تخزين منتجات منتهية الصلاحية', 'تم العثور على بعض المنتجات منتهية الصلاحية', 'main-warehouse', 'storage', 'high', 'resolved', 'non_compliant', '[]', 'user-1', daysAgo(10), daysAgo(8), 'تم التخلص من المنتجات', null, null],
      ['issue-4', 'عدم وجود سجلات تنظيف يومية', 'سجلات التنظيف اليومية غير مكتملة', 'branch-3', 'documentation', 'medium', 'open', 'partially_compliant', '[]', 'user-3', daysAgo(3), null, null, null, null],
      ['issue-5', 'تسريب مياه في منطقة التحضير', 'يوجد تسريب مياه بالقرب من منطقة تحضير الخضروات', 'central-kitchen', 'equipment', 'medium', 'in_progress', 'partially_compliant', '[]', 'user-1', daysAgo(7), null, null, 'user-1', null],
    ];

    for (const issue of issues) {
      this.db.run(
        `INSERT INTO issues (id, title, description, branch_id, category, priority, status, compliance_status, images, reported_by, reported_at, resolved_at, resolution_notes, assigned_to, follow_up_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        issue
      );
    }

    console.log('✅ Initial data seeded');
  }

  /**
   * Get current schema version
   */
  private getSchemaVersion(): number {
    const version = localStorage.getItem(this.SCHEMA_VERSION_KEY);
    return version ? parseInt(version, 10) : 0;
  }

  /**
   * Set schema version
   */
  private setSchemaVersion(version: number): void {
    localStorage.setItem(this.SCHEMA_VERSION_KEY, version.toString());
  }

  /**
   * Save database to localStorage
   */
  public save(): void {
    if (!this.db) throw new Error('Database not initialized');
    
    const data = this.db.export();
    const buffer = Array.from(data);
    localStorage.setItem(this.DB_STORAGE_KEY, JSON.stringify(buffer));
  }

  /**
   * Get database instance
   */
  public getDatabase(): Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Check if database is initialized
   */
  public isReady(): boolean {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Close database connection
   */
  public close(): void {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();
