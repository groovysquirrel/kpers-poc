/**
 * GET /performance-metrics/:id - Get a single performance metric by ID
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { PerformanceMetricRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Performance metric ID is required" }),
    };
  }

  console.log("[PerformanceMetrics] Get - Starting", { id });

  const sql = `
    SELECT id, manager_id, metric_year, return_rate, market_value, as_of_date, notes, created_at, updated_at
    FROM performance_metrics 
    WHERE id = :id
  `;
  
  const params: QueryParameter[] = [{ name: "id", value: id }];
  const result = await db.query(sql, params);
  
  if (!result.records || result.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Performance metric not found" }),
    };
  }

  const record = result.records[0];
  const metric: PerformanceMetricRow = {
    id: record[0].stringValue,
    manager_id: record[1].stringValue,
    metric_year: record[2].longValue,
    return_rate: record[3].isNull ? null : record[3].doubleValue,
    market_value: record[4].isNull ? null : record[4].longValue,
    as_of_date: record[5].stringValue,
    notes: record[6].isNull ? null : record[6].stringValue,
    created_at: record[7].stringValue,
    updated_at: record[8].stringValue,
  };

  console.log("[PerformanceMetrics] Get - Found performance metric", { id });
  return JSON.stringify(metric);
});

