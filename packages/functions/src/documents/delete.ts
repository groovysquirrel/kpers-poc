/**
 * DELETE /documents/:id - Delete a document
 */

import { handler } from "../shared/handler";
import { db } from "../shared/database";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Document ID is required" }),
    };
  }

  console.log("[Documents] Delete - Starting", { id });

  // Check if document exists
  const checkSql = "SELECT id FROM documents WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Document not found" }),
    };
  }

  // Delete the document
  const deleteSql = "DELETE FROM documents WHERE id = :id";
  await db.execute(deleteSql, [{ name: "id", value: id }]);

  console.log("[Documents] Delete - Document deleted", { id });
  return JSON.stringify({ ok: true, id });
});

