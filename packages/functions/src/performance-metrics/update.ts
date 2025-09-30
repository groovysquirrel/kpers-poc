/**
 * PUT /performance-metrics/:id - Update an existing performance metric
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { PerformanceMetricUpdateInput, PerformanceMetricRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Performance metric ID is required" }),
    };
  }

  let data: PerformanceMetricUpdateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  console.log("[PerformanceMetrics] Update - Starting", { id });

  // Check if performance metric exists
  const checkSql = "SELECT id FROM performance_metrics WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Performance metric not found" }),
    };
  }

  // Build dynamic UPDATE query based on provided fields
  const updates: string[] = [];
  const parameters: QueryParameter[] = [{ name: "id", value: id }];

  if (data.metricYear !== undefined) {
    updates.push("metric_year = :metricYear");
    parameters.push({ name: "metricYear", value: data.metricYear, type: "long" });
  }
  if (data.returnRate !== undefined) {
    updates.push("return_rate = :returnRate");
    parameters.push({ name: "returnRate", value: data.returnRate, type: "double" });
  }
  if (data.marketValue !== undefined) {
    updates.push("market_value = :marketValue");
    parameters.push({ name: "marketValue", value: data.marketValue, type: "long" });
  }
  if (data.asOfDate !== undefined) {
    updates.push("as_of_date = :asOfDate");
    parameters.push({ name: "asOfDate", value: data.asOfDate });
  }
  if (data.notes !== undefined) {
    updates.push("notes = :notes");
    parameters.push({ name: "notes", value: data.notes });
  }

  if (updates.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No fields to update" }),
    };
  }

  const updateSql = `UPDATE performance_metrics SET ${updates.join(", ")} WHERE id = :id`;
  await db.execute(updateSql, parameters);

  // Fetch the updated performance metric
  const selectSql = `
    SELECT id, manager_id, metric_year, return_rate, market_value, as_of_date, notes, created_at, updated_at
    FROM performance_metrics 
    WHERE id = :id
  `;
  
  const result = await db.query(selectSql, [{ name: "id", value: id }]);
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

  console.log("[PerformanceMetrics] Update - Performance metric updated", { id });
  return JSON.stringify(metric);
});

