/**
 * Database abstraction layer
 * Provides a clean interface that hides implementation details
 */

import { withAuroraRetry, executeStatement as auroraExecuteStatement } from "./aurora";

// ============================================
// Database Interface
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

export interface Database {
  query(sql: string, parameters?: QueryParameter[]): Promise<QueryResult>;
  execute(sql: string, parameters?: QueryParameter[]): Promise<void>;
}

// ============================================
// Aurora Implementation
// ============================================

class AuroraDatabase implements Database {
  /**
   * Execute a query and return results
   */
  async query(sql: string, parameters: QueryParameter[] = []): Promise<QueryResult> {
    return await withAuroraRetry(async () => {
      const formattedParams = this.formatParameters(parameters);
      const response = await auroraExecuteStatement(sql, formattedParams);
      
      return {
        records: response.records || [],
        numberOfRecordsUpdated: response.numberOfRecordsUpdated,
      };
    });
  }

  /**
   * Execute a statement without expecting results
   */
  async execute(sql: string, parameters: QueryParameter[] = []): Promise<void> {
    await withAuroraRetry(async () => {
      const formattedParams = this.formatParameters(parameters);
      await auroraExecuteStatement(sql, formattedParams);
    });
  }

  /**
   * Internal: Format parameters for RDS Data API
   */
  private formatParameters(params: QueryParameter[]): any[] {
    return params.map(p => {
      if (p.value === null || p.value === undefined) {
        return { name: p.name, value: { isNull: true } };
      }

      const type = p.type || this.inferType(p.value);
      
      switch (type) {
        case "string":
          return { name: p.name, value: { stringValue: String(p.value) } };
        case "long":
          return { name: p.name, value: { longValue: Number(p.value) } };
        case "double":
          return { name: p.name, value: { doubleValue: Number(p.value) } };
        case "boolean":
          return { name: p.name, value: { booleanValue: Boolean(p.value) } };
        default:
          return { name: p.name, value: { stringValue: String(p.value) } };
      }
    });
  }

  /**
   * Internal: Infer parameter type from JavaScript value
   */
  private inferType(value: any): "string" | "long" | "double" | "boolean" {
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") {
      return Number.isInteger(value) ? "long" : "double";
    }
    return "string";
  }
}

// ============================================
// Singleton Export
// ============================================

/**
 * Database instance - hides implementation details
 * All CRUD operations should use this instead of direct Aurora calls
 */
export const db = new AuroraDatabase();
