/**
 * DELETE /document-types/:id - Delete a document type
 */

import { handler } from "../shared/handler";
import { db } from "../shared/database";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Document type ID is required" }),
    };
  }

  console.log("[DocumentTypes] Delete - Starting", { id });

  // Check if document type exists
  const checkSql = "SELECT id FROM document_types WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Document type not found" }),
    };
  }

  // Delete the document type
  const deleteSql = "DELETE FROM document_types WHERE id = :id";
  await db.execute(deleteSql, [{ name: "id", value: id }]);

  console.log("[DocumentTypes] Delete - Document type deleted", { id });
  return JSON.stringify({ ok: true, id });
});

