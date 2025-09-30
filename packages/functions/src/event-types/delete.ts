/**
 * DELETE /event-types/:id - Delete an event type
 */

import { handler } from "../shared/handler";
import { db } from "../shared/database";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Event Type ID is required" }),
    };
  }

  console.log("[EventTypes] Delete - Starting", { id });

  // Check if event type exists
  const checkSql = "SELECT id FROM event_types WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Event Type not found" }),
    };
  }

  // Delete the event type
  const deleteSql = "DELETE FROM event_types WHERE id = :id";
  await db.execute(deleteSql, [{ name: "id", value: id }]);

  console.log("[EventTypes] Delete - Event type deleted", { id });
  return JSON.stringify({ ok: true, id });
});
