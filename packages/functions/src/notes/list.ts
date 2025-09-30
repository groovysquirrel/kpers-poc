/**
 * GET /notes - List all notes
 * Creates table and seeds data only if table doesn't exist
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { NoteRow } from "../shared/types";
import fs from "node:fs";

async function createTableAndSeed(): Promise<void> {
  console.log("[Notes] Table not found. Creating...");
  const schemaSql = fs.readFileSync("database/notes/schema.sql", "utf-8");
  await db.execute(schemaSql);
  console.log("[Notes] Table created successfully");

  // Seed with default data
  console.log("[Notes] Seeding default data...");
  const defaults: NoteRow[] = JSON.parse(fs.readFileSync("database/notes/data.json", "utf-8"));
  
  if (!Array.isArray(defaults) || defaults.length === 0) {
    console.log("[Notes] No default data to seed");
    return;
  }

  // Insert notes one at a time
  for (const note of defaults) {
    const sql = `
      INSERT INTO notes (id, event_id, note_type_id, subject, content, author, filename, date, url)
      VALUES (:id, :eventId, :noteTypeId, :subject, :content, :author, :filename, :date, :url)
    `;
    
    const params: QueryParameter[] = [
      { name: "id", value: note.id },
      { name: "eventId", value: note.event_id || null },
      { name: "noteTypeId", value: note.note_type_id },
      { name: "subject", value: note.subject },
      { name: "content", value: note.content },
      { name: "author", value: note.author },
      { name: "filename", value: note.filename || null },
      { name: "date", value: note.date },
      { name: "url", value: note.url || null },
    ];
    
    await db.execute(sql, params);
  }
  
  console.log(`[Notes] Seeded ${defaults.length} notes`);
}

async function selectNotes(): Promise<NoteRow[]> {
  const sql = `
    SELECT id, event_id, note_type_id, subject, content, author, filename, date, url, created_at, updated_at
    FROM notes 
    ORDER BY date DESC, created_at DESC
  `;
  
  const result = await db.query(sql);
  
  if (!result.records || result.records.length === 0) {
    return [];
  }

  // Convert Data API response format to NoteRow objects
  const notes: NoteRow[] = result.records.map((record: any) => ({
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
  }));

  return notes;
}

export const main = handler(async () => {
  console.log("[Notes] List - Starting");

  try {
    // Try to select notes directly (normal case - table exists)
    const notes = await selectNotes();
    console.log(`[Notes] List - Returning ${notes.length} notes`);
    return JSON.stringify(notes);
  } catch (err: any) {
    // Check if table doesn't exist
    if (err?.message?.includes("doesn't exist") || err?.message?.includes("Table") && err?.message?.includes("not found")) {
      // Table doesn't exist - create and seed
      await createTableAndSeed();
      
      // Retry the select
      const notes = await selectNotes();
      console.log(`[Notes] List - Returning ${notes.length} notes (after create+seed)`);
      return JSON.stringify(notes);
    }
    
    // Other error - rethrow
    throw err;
  }
});

