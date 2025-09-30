/**
 * PUT /notes/:id - Update an existing note
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { NoteUpdateInput, NoteRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Note ID is required" }),
    };
  }

  let data: NoteUpdateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  console.log("[Notes] Update - Starting", { id });

  // Check if note exists
  const checkSql = "SELECT id FROM notes WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Note not found" }),
    };
  }

  // Build dynamic UPDATE query based on provided fields
  const updates: string[] = [];
  const parameters: QueryParameter[] = [{ name: "id", value: id }];

  if (data.eventId !== undefined) {
    updates.push("event_id = :eventId");
    parameters.push({ name: "eventId", value: data.eventId });
  }
  if (data.noteTypeId !== undefined) {
    updates.push("note_type_id = :noteTypeId");
    parameters.push({ name: "noteTypeId", value: data.noteTypeId });
  }
  if (data.subject !== undefined) {
    updates.push("subject = :subject");
    parameters.push({ name: "subject", value: data.subject });
  }
  if (data.content !== undefined) {
    updates.push("content = :content");
    parameters.push({ name: "content", value: data.content });
  }
  if (data.author !== undefined) {
    updates.push("author = :author");
    parameters.push({ name: "author", value: data.author });
  }
  if (data.filename !== undefined) {
    updates.push("filename = :filename");
    parameters.push({ name: "filename", value: data.filename });
  }
  if (data.date !== undefined) {
    updates.push("date = :date");
    parameters.push({ name: "date", value: data.date });
  }
  if (data.url !== undefined) {
    updates.push("url = :url");
    parameters.push({ name: "url", value: data.url });
  }

  if (updates.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No fields to update" }),
    };
  }

  const updateSql = `UPDATE notes SET ${updates.join(", ")} WHERE id = :id`;
  await db.execute(updateSql, parameters);

  // Fetch the updated note
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

  console.log("[Notes] Update - Note updated", { id });
  return JSON.stringify(note);
});

