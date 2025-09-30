/**
 * DELETE /note-types/:id - Delete a note type
 */

import { handler } from "../shared/handler";
import { db } from "../shared/database";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Note type ID is required" }),
    };
  }

  console.log("[NoteTypes] Delete - Starting", { id });

  // Check if note type exists
  const checkSql = "SELECT id FROM note_types WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Note type not found" }),
    };
  }

  // Delete the note type
  const deleteSql = "DELETE FROM note_types WHERE id = :id";
  await db.execute(deleteSql, [{ name: "id", value: id }]);

  console.log("[NoteTypes] Delete - Note type deleted", { id });
  return JSON.stringify({ ok: true, id });
});

