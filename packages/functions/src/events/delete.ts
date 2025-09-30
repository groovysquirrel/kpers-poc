/**
 * DELETE /events/:id - Delete an event
 */

import { handler } from "../shared/handler";
import { db } from "../shared/database";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Event ID is required" }),
    };
  }

  console.log("[Events] Delete - Starting", { id });

  // Check if event exists
  const checkSql = "SELECT id FROM events WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Event not found" }),
    };
  }

  // Delete the event
  const deleteSql = "DELETE FROM events WHERE id = :id";
  await db.execute(deleteSql, [{ name: "id", value: id }]);

  console.log("[Events] Delete - Event deleted", { id });
  return JSON.stringify({ ok: true, id });
});

