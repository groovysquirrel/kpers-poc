/**
 * DELETE /notes/:id - Delete a note
 */

import { handler } from "../shared/handler";
import { db } from "../shared/database";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Note ID is required" }),
    };
  }

  console.log("[Notes] Delete - Starting", { id });

  // Check if note exists
  const checkSql = "SELECT id FROM notes WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Note not found" }),
    };
  }

  // Delete the note
  const deleteSql = "DELETE FROM notes WHERE id = :id";
  await db.execute(deleteSql, [{ name: "id", value: id }]);

  console.log("[Notes] Delete - Note deleted", { id });
  return JSON.stringify({ ok: true, id });
});

