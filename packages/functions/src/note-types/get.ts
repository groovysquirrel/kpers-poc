/**
 * GET /note-types/:id - Get a single note type by ID
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { NoteTypeRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Note type ID is required" }),
    };
  }

  console.log("[NoteTypes] Get - Starting", { id });

  const sql = `
    SELECT id, name, description, is_active, display_order, created_at, updated_at
    FROM note_types 
    WHERE id = :id
  `;
  
  const params: QueryParameter[] = [{ name: "id", value: id }];
  const result = await db.query(sql, params);
  
  if (!result.records || result.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Note type not found" }),
    };
  }

  const record = result.records[0];
  const noteType: NoteTypeRow = {
    id: record[0].stringValue,
    name: record[1].stringValue,
    description: record[2].isNull ? null : record[2].stringValue,
    is_active: record[3].booleanValue,
    display_order: record[4].isNull ? null : record[4].longValue,
    created_at: record[5].stringValue,
    updated_at: record[6].stringValue,
  };

  console.log("[NoteTypes] Get - Found note type", { id });
  return JSON.stringify(noteType);
});

