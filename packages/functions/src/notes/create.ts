/**
 * POST /notes - Create a new note
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { NoteCreateInput, NoteRow } from "../shared/types";
import * as uuid from "uuid";

export const main = handler(async (event) => {
  let data: NoteCreateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // Validate required fields
  if (!data.noteTypeId || !data.subject || !data.content || !data.author || !data.date) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: "Missing required fields: noteTypeId, subject, content, author, date" 
      }),
    };
  }

  const id = uuid.v4();
  console.log("[Notes] Create - Starting", { id });

  const sql = `
    INSERT INTO notes (id, event_id, note_type_id, subject, content, author, filename, date, url)
    VALUES (:id, :eventId, :noteTypeId, :subject, :content, :author, :filename, :date, :url)
  `;
  
  const params: QueryParameter[] = [
    { name: "id", value: id },
    { name: "eventId", value: data.eventId || null },
    { name: "noteTypeId", value: data.noteTypeId },
    { name: "subject", value: data.subject },
    { name: "content", value: data.content },
    { name: "author", value: data.author },
    { name: "filename", value: data.filename || null },
    { name: "date", value: data.date },
    { name: "url", value: data.url || null },
  ];
  
  await db.execute(sql, params);

  // Fetch the created note
  const selectSql = `
    SELECT id, event_id, note_type_id, subject, content, author, filename, date, url, created_at, updated_at
    FROM notes 
    WHERE id = :id
  `;
  
  const result = await db.query(selectSql, [{ name: "id", value: id }]);
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

  console.log("[Notes] Create - Note created", { id });
  return JSON.stringify(note);
});

