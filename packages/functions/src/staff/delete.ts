/**
 * DELETE /staff/:id - Delete a staff member
 */

import { handler } from "../shared/handler";
import { db } from "../shared/database";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Staff ID is required" }),
    };
  }

  console.log("[Staff] Delete - Starting", { id });

  // Check if staff member exists
  const checkSql = "SELECT id FROM staff WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Staff member not found" }),
    };
  }

  // Delete the staff member
  const deleteSql = "DELETE FROM staff WHERE id = :id";
  await db.execute(deleteSql, [{ name: "id", value: id }]);

  console.log("[Staff] Delete - Staff member deleted", { id });
  return JSON.stringify({ ok: true, id });
});

