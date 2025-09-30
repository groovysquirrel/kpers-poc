/**
 * Database abstraction layer
 * Defines the database interface - completely agnostic of implementation
 */

// ============================================
// Database Interface (Pure Abstraction)
// ============================================

export interface QueryParameter {
  name: string;
  value: string | number | boolean | null;
  type?: "string" | "long" | "double" | "boolean";
}

export interface QueryResult {
  records: any[];
  numberOfRecordsUpdated?: number;
}

/**
 * Database interface that all implementations must follow
 * Implementations: aurora.ts, postgres.ts, dynamodb.ts, etc.
 */
export interface Database {
  query(sql: string, parameters?: QueryParameter[]): Promise<QueryResult>;
  execute(sql: string, parameters?: QueryParameter[]): Promise<void>;
}

// ============================================
// Database Instance (Factory)
// ============================================

import { AuroraDatabase } from "./aurora";

/**
 * Database instance - injected implementation
 * To swap databases, just change this line:
 * - export const db: Database = new AuroraDatabase();
 * - export const db: Database = new PostgresDatabase();
 * - export const db: Database = new DynamoDBDatabase();
 */
export const db: Database = new AuroraDatabase();
