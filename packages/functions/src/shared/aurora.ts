/**
 * Aurora RDS Data API Implementation
 * Implements the Database interface for AWS Aurora Serverless
 */

import { Resource } from "sst";
import { RDSDataClient, ExecuteStatementCommand } from "@aws-sdk/client-rds-data";
import type { Database, QueryParameter, QueryResult } from "./database";

// ============================================
// Low-Level Aurora Utilities
// ============================================

export const client = new RDSDataClient({});

/**
 * Retry wrapper for Aurora Serverless auto-pause/resume
 * Automatically retries DatabaseResumingException with exponential backoff
 */
export async function withAuroraRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 10000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      
      // Check if this is a DatabaseResumingException
      const isResuming = err?.name === "DatabaseResumingException" || 
                        err?.message?.includes("resuming after being auto-paused");
      
      if (isResuming && attempt < maxRetries) {
        const delayMs = baseDelayMs * (attempt + 1); // 10s, 20s, 30s
        console.warn(`[Aurora] Database is resuming from auto-pause. Retry ${attempt + 1}/${maxRetries} in ${delayMs}ms`, {
          error: err?.message,
          requestId: err?.$metadata?.requestId,
        });
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      // Not a resuming error or out of retries - throw
      throw err;
    }
  }
  
  throw lastError;
}

/**
 * Execute a SQL statement using RDS Data API
 */
export async function executeStatement(
  sql: string,
  parameters: any[] = []
): Promise<any> {
  const clusterArn = Resource.KPERSPOCMySQL.clusterArn;
  const secretArn = Resource.KPERSPOCMySQL.secretArn;
  const database = Resource.KPERSPOCMySQL.database;

  console.log("[Aurora] Executing SQL", { 
    sql: sql.substring(0, 100) + (sql.length > 100 ? "..." : ""), 
    paramCount: parameters.length 
  });
  
  const command = new ExecuteStatementCommand({
    resourceArn: clusterArn,
    secretArn: secretArn,
    database: database,
    sql: sql,
    parameters: parameters.length > 0 ? parameters : undefined,
  });

  const response = await client.send(command);
  return response;
}

/**
 * Helper to create a SQL parameter for Data API
 */
export function param(name: string, value: any, type: "string" | "long" | "double" | "boolean" | "blob" = "string") {
  if (value === null || value === undefined) {
    return { name, value: { isNull: true } };
  }
  
  switch (type) {
    case "string":
      return { name, value: { stringValue: String(value) } };
    case "long":
      return { name, value: { longValue: Number(value) } };
    case "double":
      return { name, value: { doubleValue: Number(value) } };
    case "boolean":
      return { name, value: { booleanValue: Boolean(value) } };
    case "blob":
      return { name, value: { blobValue: value } };
    default:
      return { name, value: { stringValue: String(value) } };
  }
}

// ============================================
// Database Implementation
// ============================================

/**
 * Aurora implementation of the Database interface
 * Uses RDS Data API with automatic retry for auto-pause/resume
 */
export class AuroraDatabase implements Database {
  /**
   * Execute a query and return results
   */
  async query(sql: string, parameters: QueryParameter[] = []): Promise<QueryResult> {
    return await withAuroraRetry(async () => {
      const formattedParams = this.formatParameters(parameters);
      const response = await executeStatement(sql, formattedParams);
      
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
      await executeStatement(sql, formattedParams);
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
