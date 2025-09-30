/**
 * GET /note-types - List all note types
 * Creates table and seeds data only if table doesn't exist
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { NoteTypeRow } from "../shared/types";
import fs from "node:fs";

async function createTableAndSeed(): Promise<void> {
  console.log("[NoteTypes] Table not found. Creating...");
  const schemaSql = fs.readFileSync("database/note-types/schema.sql", "utf-8");
  await db.execute(schemaSql);
  console.log("[NoteTypes] Table created successfully");

  // Seed with default data
  console.log("[NoteTypes] Seeding default data...");
  const defaults: NoteTypeRow[] = JSON.parse(fs.readFileSync("database/note-types/data.json", "utf-8"));
  
  if (!Array.isArray(defaults) || defaults.length === 0) {
    console.log("[NoteTypes] No default data to seed");
    return;
  }

  // Insert note types one at a time
  for (const noteType of defaults) {
    const sql = `
      INSERT INTO note_types (id, name, description, is_active, display_order)
      VALUES (:id, :name, :description, :isActive, :displayOrder)
    `;
    
    const params: QueryParameter[] = [
      { name: "id", value: noteType.id },
      { name: "name", value: noteType.name },
      { name: "description", value: noteType.description || null },
      { name: "isActive", value: noteType.is_active, type: "boolean" },
      { name: "displayOrder", value: noteType.display_order, type: "long" },
    ];
    
    await db.execute(sql, params);
  }
  
  console.log(`[NoteTypes] Seeded ${defaults.length} note types`);
}

async function selectNoteTypes(): Promise<NoteTypeRow[]> {
  const sql = `
    SELECT id, name, description, is_active, display_order, created_at, updated_at
    FROM note_types 
    ORDER BY display_order, name
  `;
  
  const result = await db.query(sql);
  
  if (!result.records || result.records.length === 0) {
    return [];
  }

  // Convert Data API response format to NoteTypeRow objects
  const noteTypes: NoteTypeRow[] = result.records.map((record: any) => ({
    id: record[0].stringValue,
    name: record[1].stringValue,
    description: record[2].isNull ? null : record[2].stringValue,
    is_active: record[3].booleanValue,
    display_order: record[4].isNull ? null : record[4].longValue,
    created_at: record[5].stringValue,
    updated_at: record[6].stringValue,
  }));

  return noteTypes;
}

export const main = handler(async () => {
  console.log("[NoteTypes] List - Starting");

  try {
    // Try to select note types directly (normal case - table exists)
    const noteTypes = await selectNoteTypes();
    console.log(`[NoteTypes] List - Returning ${noteTypes.length} note types`);
    return JSON.stringify(noteTypes);
  } catch (err: any) {
    // Check if table doesn't exist
    if (err?.message?.includes("doesn't exist") || err?.message?.includes("Table") && err?.message?.includes("not found")) {
      // Table doesn't exist - create and seed
      await createTableAndSeed();
      
      // Retry the select
      const noteTypes = await selectNoteTypes();
      console.log(`[NoteTypes] List - Returning ${noteTypes.length} note types (after create+seed)`);
      return JSON.stringify(noteTypes);
    }
    
    // Other error - rethrow
    throw err;
  }
});

