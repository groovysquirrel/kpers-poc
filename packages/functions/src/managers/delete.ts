/**
 * DELETE /managers/:id - Delete a manager
 */

import { handler } from "../shared/handler";
import { db } from "../shared/database";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Manager ID is required" }),
    };
  }

  console.log("[Managers] Delete - Starting", { id });

  // Check if manager exists
  const checkSql = "SELECT id FROM managers WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Manager not found" }),
    };
  }

  // Delete the manager
  const deleteSql = "DELETE FROM managers WHERE id = :id";
  await db.execute(deleteSql, [{ name: "id", value: id }]);

  console.log("[Managers] Delete - Manager deleted", { id });
  return JSON.stringify({ ok: true, id });
});
