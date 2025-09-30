/**
 * GET /notes/:id - Get a single note by ID
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { NoteRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Note ID is required" }),
    };
  }

  console.log("[Notes] Get - Starting", { id });

  const sql = `
    SELECT id, event_id, note_type_id, subject, content, author, filename, date, url, created_at, updated_at
    FROM notes 
    WHERE id = :id
  `;
  
  const params: QueryParameter[] = [{ name: "id", value: id }];
  const result = await db.query(sql, params);
  
  if (!result.records || result.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Note not found" }),
    };
  }

  const record = result.records[0];
  const note: NoteRow = {
    id: record[0].stringValue,
    event_id: record[1].isNull ? null : record[1].stringValue,
    note_type_id: record[2].stringValue,
    subject: record[3].stringValue,
    content: record[4].stringValue,
    author: record[5].stringValue,
    filename: record[6].isNull ? null : record[6].stringValue,
    date: record[7].stringValue,
    url: record[8].isNull ? null : record[8].stringValue,
    created_at: record[9].stringValue,
    updated_at: record[10].stringValue,
  };

  console.log("[Notes] Get - Found note", { id });
  return JSON.stringify(note);
});

