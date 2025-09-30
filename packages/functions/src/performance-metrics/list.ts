/**
 * GET /performance-metrics - List all performance metrics
 * Creates table and seeds data only if table doesn't exist
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { PerformanceMetricRow } from "../shared/types";
import fs from "node:fs";

async function createTableAndSeed(): Promise<void> {
  console.log("[PerformanceMetrics] Table not found. Creating...");
  const schemaSql = fs.readFileSync("database/performance-metrics/schema.sql", "utf-8");
  await db.execute(schemaSql);
  console.log("[PerformanceMetrics] Table created successfully");

  // Seed with default data
  console.log("[PerformanceMetrics] Seeding default data...");
  const defaults: PerformanceMetricRow[] = JSON.parse(fs.readFileSync("database/performance-metrics/data.json", "utf-8"));
  
  if (!Array.isArray(defaults) || defaults.length === 0) {
    console.log("[PerformanceMetrics] No default data to seed");
    return;
  }

  // Insert performance metrics one at a time
  for (const metric of defaults) {
    const sql = `
      INSERT INTO performance_metrics (id, manager_id, metric_year, return_rate, market_value, as_of_date, notes)
      VALUES (:id, :managerId, :metricYear, :returnRate, :marketValue, :asOfDate, :notes)
    `;
    
    const params: QueryParameter[] = [
      { name: "id", value: metric.id },
      { name: "managerId", value: metric.manager_id },
      { name: "metricYear", value: metric.metric_year, type: "long" },
      { name: "returnRate", value: metric.return_rate, type: "double" },
      { name: "marketValue", value: metric.market_value, type: "long" },
      { name: "asOfDate", value: metric.as_of_date },
      { name: "notes", value: metric.notes || null },
    ];
    
    await db.execute(sql, params);
  }
  
  console.log(`[PerformanceMetrics] Seeded ${defaults.length} performance metrics`);
}

async function selectPerformanceMetrics(managerId?: string, metricYear?: number): Promise<PerformanceMetricRow[]> {
  let sql = `
    SELECT id, manager_id, metric_year, return_rate, market_value, as_of_date, notes, created_at, updated_at
    FROM performance_metrics 
  `;
  
  const params: QueryParameter[] = [];
  const conditions: string[] = [];
  
  if (managerId) {
    conditions.push(`manager_id = :managerId`);
    params.push({ name: "managerId", value: managerId });
  }
  
  if (metricYear) {
    conditions.push(`metric_year = :metricYear`);
    params.push({ name: "metricYear", value: metricYear, type: "long" });
  }
  
  if (conditions.length > 0) {
    sql += `WHERE ${conditions.join(' AND ')} `;
  }
  
  sql += `ORDER BY as_of_date DESC, metric_year DESC`;
  
  const result = params.length > 0 ? await db.query(sql, params) : await db.query(sql);
  
  if (!result.records || result.records.length === 0) {
    return [];
  }

  // Convert Data API response format to PerformanceMetricRow objects
  const metrics: PerformanceMetricRow[] = result.records.map((record: any) => ({
    id: record[0].stringValue,
    manager_id: record[1].stringValue,
    metric_year: record[2].longValue,
    return_rate: record[3].isNull ? null : record[3].doubleValue,
    market_value: record[4].isNull ? null : record[4].longValue,
    as_of_date: record[5].stringValue,
    notes: record[6].isNull ? null : record[6].stringValue,
    created_at: record[7].stringValue,
    updated_at: record[8].stringValue,
  }));

  return metrics;
}

export const main = handler(async (event) => {
  console.log("[PerformanceMetrics] List - Starting");
  
  // Extract query parameters
  const managerId = event.queryStringParameters?.managerId;
  const metricYearStr = event.queryStringParameters?.metricYear;
  const metricYear = metricYearStr ? parseInt(metricYearStr, 10) : undefined;
  
  console.log(`[PerformanceMetrics] Filters - managerId: ${managerId}, metricYear: ${metricYear}`);

  try {
    // Try to select performance metrics directly (normal case - table exists)
    const metrics = await selectPerformanceMetrics(managerId, metricYear);
    console.log(`[PerformanceMetrics] List - Returning ${metrics.length} performance metrics`);
    return JSON.stringify(metrics);
  } catch (err: any) {
    // Check if table doesn't exist
    if (err?.message?.includes("doesn't exist") || err?.message?.includes("Table") && err?.message?.includes("not found")) {
      // Table doesn't exist - create and seed
      await createTableAndSeed();
      
      // Retry the select
      const metrics = await selectPerformanceMetrics(managerId, metricYear);
      console.log(`[PerformanceMetrics] List - Returning ${metrics.length} performance metrics (after create+seed)`);
      return JSON.stringify(metrics);
    }
    
    // Other error - rethrow
    throw err;
  }
});

