/**
 * POST /performance-metrics - Create a new performance metric
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { PerformanceMetricCreateInput, PerformanceMetricRow } from "../shared/types";
import * as uuid from "uuid";

export const main = handler(async (event) => {
  let data: PerformanceMetricCreateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // Validate required fields
  if (!data.managerId || !data.metricYear || !data.asOfDate) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: "Missing required fields: managerId, metricYear, asOfDate" 
      }),
    };
  }

  const id = uuid.v4();
  console.log("[PerformanceMetrics] Create - Starting", { id });

  const sql = `
    INSERT INTO performance_metrics (id, manager_id, metric_year, return_rate, market_value, as_of_date, notes)
    VALUES (:id, :managerId, :metricYear, :returnRate, :marketValue, :asOfDate, :notes)
  `;
  
  const params: QueryParameter[] = [
    { name: "id", value: id },
    { name: "managerId", value: data.managerId },
    { name: "metricYear", value: data.metricYear, type: "long" },
    { name: "returnRate", value: data.returnRate || null, type: "double" },
    { name: "marketValue", value: data.marketValue || null, type: "long" },
    { name: "asOfDate", value: data.asOfDate },
    { name: "notes", value: data.notes || null },
  ];
  
  await db.execute(sql, params);

  // Fetch the created performance metric
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

  console.log("[PerformanceMetrics] Create - Performance metric created", { id });
  return JSON.stringify(metric);
});

