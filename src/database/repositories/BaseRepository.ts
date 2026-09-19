/**
 * Base Repository
 * 
 * Abstract base class for all repositories.
 * Provides common CRUD operations and query building.
 */

import { dbManager } from '../connection';

export abstract class BaseRepository<T extends { id: string }> {
  protected abstract tableName: string;
  protected abstract mapRow(row: any): T;

  /**
   * Get database instance
   */
  protected get db() {
    return dbManager.getDatabase();
  }

  /**
   * Find all records
   */
  findAll(): T[] {
    const results = this.db.exec(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    if (results.length === 0) return [];
    
    return results[0].values.map(row => {
      const obj: any = {};
      results[0].columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return this.mapRow(obj);
    });
  }

  /**
   * Find record by ID
   */
  findById(id: string): T | null {
    const results = this.db.exec(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    if (results.length === 0 || results[0].values.length === 0) return null;
    
    const row = results[0].values[0];
    const obj: any = {};
    results[0].columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    
    return this.mapRow(obj);
  }

  /**
   * Find records with custom WHERE clause
   */
  protected findWhere(whereClause: string, params: any[] = []): T[] {
    const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause} ORDER BY created_at DESC`;
    const results = this.db.exec(sql, params);
    
    if (results.length === 0) return [];
    
    return results[0].values.map(row => {
      const obj: any = {};
      results[0].columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return this.mapRow(obj);
    });
  }

  /**
   * Insert a new record
   */
  protected insert(record: any): void {
    const columns = Object.keys(record).filter(key => record[key] !== undefined);
    const values = columns.map(key => record[key]);
    const placeholders = columns.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    this.db.run(sql, values);
    dbManager.save();
  }

  /**
   * Update a record
   */
  protected update(id: string, updates: Partial<any>): void {
    const columns = Object.keys(updates).filter(key => updates[key] !== undefined);
    if (columns.length === 0) return;
    
    const values = columns.map(key => updates[key]);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    
    const sql = `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    this.db.run(sql, [...values, id]);
    dbManager.save();
  }

  /**
   * Delete a record
   */
  protected delete(id: string): void {
    this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    dbManager.save();
  }

  /**
   * Count records
   */
  protected count(whereClause?: string, params: any[] = []): number {
    const sql = whereClause 
      ? `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${whereClause}`
      : `SELECT COUNT(*) as count FROM ${this.tableName}`;
    
    const results = this.db.exec(sql, params);
    if (results.length === 0 || results[0].values.length === 0) return 0;
    
    return results[0].values[0][0] as number;
  }
}
