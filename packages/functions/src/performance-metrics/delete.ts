/**
 * DELETE /performance-metrics/:id - Delete a performance metric
 */

import { handler } from "../shared/handler";
import { db } from "../shared/database";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Performance metric ID is required" }),
    };
  }

  console.log("[PerformanceMetrics] Delete - Starting", { id });

  // Check if performance metric exists
  const checkSql = "SELECT id FROM performance_metrics WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Performance metric not found" }),
    };
  }

  // Delete the performance metric
  const deleteSql = "DELETE FROM performance_metrics WHERE id = :id";
  await db.execute(deleteSql, [{ name: "id", value: id }]);

  console.log("[PerformanceMetrics] Delete - Performance metric deleted", { id });
  return JSON.stringify({ ok: true, id });
});

